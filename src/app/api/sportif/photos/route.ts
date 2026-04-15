import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { s3KeyToPublicPath } from "@/lib/s3";

// GET — photos du sportif cross-événement
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  // 1. Find purchased photo IDs
  const purchasedItems = await prisma.orderItem.findMany({
    where: { order: { userId, status: { in: ["PAID", "DELIVERED"] } } },
    select: { photoId: true },
  });
  const purchasedPhotoIds = new Set(purchasedItems.map((i) => i.photoId));

  // 2. Find bib numbers from start-list entries (by email)
  const startListEntries = await prisma.startListEntry.findMany({
    where: { email: userEmail },
    select: { bibNumber: true, eventId: true },
  });

  // 3. For each start-list entry, find photos with those bib numbers
  const photosByEvent: Record<string, {
    event: { id: string; name: string; date: string; location: string | null; sportType: string; coverImage: string | null };
    photos: { id: string; thumbnail: string | null; webPath: string | null; purchased: boolean }[];
  }> = {};

  for (const entry of startListEntries) {
    const bibPhotos = await prisma.bibNumber.findMany({
      where: { number: entry.bibNumber, photo: { eventId: entry.eventId } },
      include: {
        photo: {
          select: {
            id: true,
            thumbnailPath: true,
            webPath: true,
            event: {
              select: { id: true, name: true, date: true, location: true, sportType: true, coverImage: true },
            },
          },
        },
      },
    });

    for (const bib of bibPhotos) {
      const eventId = bib.photo.event.id;
      if (!photosByEvent[eventId]) {
        photosByEvent[eventId] = {
          event: {
            ...bib.photo.event,
            date: bib.photo.event.date.toISOString(),
          },
          photos: [],
        };
      }
      // Avoid duplicates
      if (!photosByEvent[eventId].photos.find((p) => p.id === bib.photo.id)) {
        photosByEvent[eventId].photos.push({
          id: bib.photo.id,
          thumbnail: bib.photo.thumbnailPath ? s3KeyToPublicPath(bib.photo.thumbnailPath) : null,
          webPath: bib.photo.webPath ? s3KeyToPublicPath(bib.photo.webPath) : null,
          purchased: purchasedPhotoIds.has(bib.photo.id),
        });
      }
    }
  }

  // 4. Also add purchased photos not from start-list
  const purchasedPhotos = await prisma.orderItem.findMany({
    where: { order: { userId, status: { in: ["PAID", "DELIVERED"] } } },
    include: {
      photo: {
        select: {
          id: true,
          thumbnailPath: true,
          webPath: true,
          event: {
            select: { id: true, name: true, date: true, location: true, sportType: true, coverImage: true },
          },
        },
      },
    },
  });

  for (const item of purchasedPhotos) {
    const eventId = item.photo.event.id;
    if (!photosByEvent[eventId]) {
      photosByEvent[eventId] = {
        event: {
          ...item.photo.event,
          date: item.photo.event.date.toISOString(),
        },
        photos: [],
      };
    }
    if (!photosByEvent[eventId].photos.find((p) => p.id === item.photo.id)) {
      photosByEvent[eventId].photos.push({
        id: item.photo.id,
        thumbnail: item.photo.thumbnailPath ? s3KeyToPublicPath(item.photo.thumbnailPath) : null,
        webPath: item.photo.webPath ? s3KeyToPublicPath(item.photo.webPath) : null,
        purchased: true,
      });
    }
  }

  // Sort events by date descending
  const result = Object.values(photosByEvent).sort(
    (a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()
  );

  return NextResponse.json(result);
}
