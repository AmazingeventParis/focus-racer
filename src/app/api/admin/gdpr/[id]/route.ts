import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: get a single GDPR request with full audit trail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const gdprRequest = await prisma.gdprRequest.findUnique({
      where: { id },
      include: {
        auditLogs: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!gdprRequest) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json(gdprRequest);
  } catch (error) {
    console.error("GDPR get error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH: update status or process the request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, adminNote } = body;

    const gdprRequest = await prisma.gdprRequest.findUnique({
      where: { id },
    });

    if (!gdprRequest) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    if (action === "reject") {
      await prisma.gdprRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          adminNote: adminNote || null,
          processedBy: session.user.id,
          processedAt: new Date(),
        },
      });

      await prisma.gdprAuditLog.create({
        data: {
          requestId: id,
          action: "REQUEST_REJECTED",
          details: adminNote || "Demande rejetée par l'administrateur",
          performedBy: session.user.id,
        },
      });

      return NextResponse.json({ status: "REJECTED" });
    }

    if (action === "process") {
      // Mark as processing
      await prisma.gdprRequest.update({
        where: { id },
        data: { status: "PROCESSING" },
      });

      await prisma.gdprAuditLog.create({
        data: {
          requestId: id,
          action: "PROCESSING_STARTED",
          details: "Traitement de la demande en cours",
          performedBy: session.user.id,
        },
      });

      let photosDeleted = 0;
      let facesDeleted = 0;

      if (gdprRequest.type === "DELETION") {
        // Find all photos associated with this person
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bibWhere: any = {};

        if (gdprRequest.bibNumber && gdprRequest.eventId) {
          bibWhere.number = gdprRequest.bibNumber;
          bibWhere.photo = { eventId: gdprRequest.eventId };
        } else if (gdprRequest.bibNumber) {
          bibWhere.number = gdprRequest.bibNumber;
        }

        if (Object.keys(bibWhere).length > 0) {
          // Find photos via bib numbers
          const bibNumbers = await prisma.bibNumber.findMany({
            where: bibWhere,
            include: { photo: true },
          });

          const photoIds = [...new Set(bibNumbers.map((b) => b.photoId))];

          if (photoIds.length > 0) {
            // GDPR erasure: remove S3 files AND Rekognition face vectors,
            // not just the DB records — biometric data must actually be erased
            try {
              const { collectPhotoS3Keys } = await import("@/lib/storage");
              const { deleteMultipleFromS3 } = await import("@/lib/s3");
              const { deleteIndexedFaces } = await import("@/lib/rekognition");

              const photosToErase = await prisma.photo.findMany({
                where: { id: { in: photoIds } },
                select: {
                  path: true,
                  webPath: true,
                  thumbnailPath: true,
                  faces: { select: { faceId: true } },
                },
              });

              const s3Keys = photosToErase.flatMap((p) =>
                collectPhotoS3Keys({ ...p, faces: [] })
              );
              // Crops are selected separately to also count real faces
              const cropPaths = await prisma.photoFace.findMany({
                where: { photoId: { in: photoIds } },
                select: { cropPath: true, faceId: true },
              });
              for (const f of cropPaths) {
                if (f.cropPath) s3Keys.push(f.cropPath);
              }

              if (s3Keys.length > 0) {
                await deleteMultipleFromS3(s3Keys);
              }
              const faceIds = cropPaths.map((f) => f.faceId);
              await deleteIndexedFaces(faceIds);
              facesDeleted = faceIds.length;
            } catch (cleanupErr) {
              console.error("[GDPR] S3/Rekognition cleanup error:", cleanupErr);
            }

            // Delete bib numbers
            await prisma.bibNumber.deleteMany({
              where: { photoId: { in: photoIds } },
            });

            // Delete order items referencing these photos
            await prisma.orderItem.deleteMany({
              where: { photoId: { in: photoIds } },
            });

            // Delete photos
            const deleted = await prisma.photo.deleteMany({
              where: { id: { in: photoIds } },
            });
            photosDeleted = deleted.count;

            await prisma.gdprAuditLog.create({
              data: {
                requestId: id,
                action: "PHOTOS_DELETED",
                details: `${photosDeleted} photo(s) supprimée(s) pour le dossard #${gdprRequest.bibNumber}`,
                performedBy: session.user.id,
              },
            });
          }
        }

        // Delete start-list entries
        const startListDeleted = await prisma.startListEntry.deleteMany({
          where: {
            email: gdprRequest.email,
            ...(gdprRequest.eventId ? { eventId: gdprRequest.eventId } : {}),
          },
        });

        if (startListDeleted.count > 0) {
          await prisma.gdprAuditLog.create({
            data: {
              requestId: id,
              action: "STARTLIST_ENTRIES_DELETED",
              details: `${startListDeleted.count} entrée(s) start-list supprimée(s) pour ${gdprRequest.email}`,
              performedBy: session.user.id,
            },
          });
        }

        // Delete user orders (guest)
        const ordersUpdated = await prisma.order.updateMany({
          where: { guestEmail: gdprRequest.email },
          data: {
            guestEmail: null,
            guestName: null,
          },
        });

        if (ordersUpdated.count > 0) {
          await prisma.gdprAuditLog.create({
            data: {
              requestId: id,
              action: "ORDERS_ANONYMIZED",
              details: `${ordersUpdated.count} commande(s) anonymisée(s)`,
              performedBy: session.user.id,
            },
          });
        }

        // facesDeleted is now the real count of face vectors removed from
        // the Rekognition collection (set during cleanup above)
      }

      // Mark as completed
      await prisma.gdprRequest.update({
        where: { id },
        data: {
          status: "COMPLETED",
          processedBy: session.user.id,
          processedAt: new Date(),
          photosDeleted,
          facesDeleted,
          adminNote: adminNote || null,
        },
      });

      await prisma.gdprAuditLog.create({
        data: {
          requestId: id,
          action: "REQUEST_COMPLETED",
          details: `Traitement terminé : ${photosDeleted} photo(s), ${facesDeleted} visage(s) supprimé(s)`,
          performedBy: session.user.id,
        },
      });

      return NextResponse.json({
        status: "COMPLETED",
        photosDeleted,
        facesDeleted,
      });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch (error) {
    console.error("GDPR process error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement" },
      { status: 500 }
    );
  }
}
