import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — Liste les conversations du user dans sa horde
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user's horde (owned or member of)
  const hordeId = await getUserHordeId(userId);
  if (!hordeId) {
    return NextResponse.json([]);
  }

  const conversations = await prisma.hordeConversation.findMany({
    where: {
      hordeId,
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, sportifId: true, faceImagePath: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Compute unread counts
  const result = conversations.map((conv) => {
    const myParticipant = conv.participants.find((p) => p.userId === userId);
    const lastReadAt = myParticipant?.lastReadAt || new Date(0);
    const lastMessage = conv.messages[0] || null;

    return {
      id: conv.id,
      type: conv.type,
      name: conv.name,
      hordeId: conv.hordeId,
      createdById: conv.createdById,
      participants: conv.participants.map((p) => ({
        userId: p.userId,
        user: p.user,
        lastReadAt: p.lastReadAt,
      })),
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            user: lastMessage.user,
          }
        : null,
      unreadCount: lastMessage && lastMessage.createdAt > lastReadAt && lastMessage.userId !== userId ? 1 : 0,
      updatedAt: conv.updatedAt,
    };
  });

  // Compute real unread counts with a single query
  if (result.length > 0) {
    const participantData = await prisma.hordeConversationParticipant.findMany({
      where: { userId, conversationId: { in: result.map((c) => c.id) } },
      select: { conversationId: true, lastReadAt: true },
    });
    const readMap = new Map(participantData.map((p) => [p.conversationId, p.lastReadAt]));

    for (const conv of result) {
      const lastRead = readMap.get(conv.id) || new Date(0);
      const count = await prisma.hordeMessage.count({
        where: {
          conversationId: conv.id,
          createdAt: { gt: lastRead },
          userId: { not: userId },
        },
      });
      conv.unreadCount = count;
    }
  }

  return NextResponse.json(result);
}

// POST — Créer une conversation (GROUP ou DM)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { type, name, participantIds } = body as {
    type: "GROUP" | "DM";
    name?: string;
    participantIds: string[];
  };

  if (!type || !["GROUP", "DM"].includes(type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return NextResponse.json({ error: "Participants requis" }, { status: 400 });
  }

  // Get user's horde
  const hordeId = await getUserHordeId(userId);
  if (!hordeId) {
    return NextResponse.json({ error: "Horde introuvable" }, { status: 404 });
  }

  // Verify all participants are members (ACCEPTED) or owner of the horde
  const horde = await prisma.horde.findUnique({
    where: { id: hordeId },
    include: { members: { where: { status: "ACCEPTED" } } },
  });

  if (!horde) {
    return NextResponse.json({ error: "Horde introuvable" }, { status: 404 });
  }

  const validUserIds = new Set([
    horde.ownerId,
    ...horde.members.map((m) => m.userId),
  ]);

  for (const pid of participantIds) {
    if (!validUserIds.has(pid)) {
      return NextResponse.json(
        { error: `L'utilisateur ${pid} n'est pas membre de la horde` },
        { status: 400 }
      );
    }
  }

  if (type === "GROUP") {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Nom requis pour un groupe" }, { status: 400 });
    }
    if (name.trim().length > 50) {
      return NextResponse.json({ error: "Nom trop long (max 50 caractères)" }, { status: 400 });
    }

    const allParticipants = [...new Set([userId, ...participantIds])];

    const conversation = await prisma.hordeConversation.create({
      data: {
        hordeId,
        type: "GROUP",
        name: name.trim(),
        createdById: userId,
        participants: {
          create: allParticipants.map((uid) => ({ userId: uid })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, sportifId: true, faceImagePath: true } },
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  }

  // DM
  if (participantIds.length !== 1) {
    return NextResponse.json({ error: "Un seul participant pour un DM" }, { status: 400 });
  }

  const partnerId = participantIds[0];
  if (partnerId === userId) {
    return NextResponse.json({ error: "Impossible de créer un DM avec vous-même" }, { status: 400 });
  }

  // Check if DM already exists between these two users in this horde
  const existingDM = await prisma.hordeConversation.findFirst({
    where: {
      hordeId,
      type: "DM",
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: partnerId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, sportifId: true, faceImagePath: true } },
        },
      },
    },
  });

  if (existingDM) {
    return NextResponse.json(existingDM);
  }

  const conversation = await prisma.hordeConversation.create({
    data: {
      hordeId,
      type: "DM",
      createdById: userId,
      participants: {
        create: [{ userId }, { userId: partnerId }],
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, sportifId: true, faceImagePath: true } },
        },
      },
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}

// Helper: get the hordeId for a user (owner or accepted member)
async function getUserHordeId(userId: string): Promise<string | null> {
  // Check if user owns a horde
  const ownedHorde = await prisma.horde.findUnique({
    where: { ownerId: userId },
    select: { id: true },
  });
  if (ownedHorde) return ownedHorde.id;

  // Check if user is an accepted member of a horde
  const membership = await prisma.hordeMember.findFirst({
    where: { userId, status: "ACCEPTED" },
    select: { hordeId: true },
  });
  return membership?.hordeId || null;
}
