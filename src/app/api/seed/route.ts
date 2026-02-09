import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  // Protect with a secret token
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if already seeded
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@focusracer.com" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Database already seeded",
        seeded: false,
      });
    }

    // Seed users
    const admin = await prisma.user.create({
      data: {
        email: "admin@focusracer.com",
        password: await bcrypt.hash("admin123", 10),
        name: "Admin Focus Racer",
        role: "ADMIN",
      },
    });

    const photographer = await prisma.user.create({
      data: {
        email: "photographe@test.com",
        password: await bcrypt.hash("photo123", 10),
        name: "Pierre Photo",
        role: "PHOTOGRAPHER",
        company: "Photo Sport Pro",
        phone: "+33 6 12 34 56 78",
      },
    });

    const runner = await prisma.user.create({
      data: {
        email: "coureur@test.com",
        password: await bcrypt.hash("runner123", 10),
        name: "Marie Coureur",
        role: "RUNNER",
      },
    });

    const organizer = await prisma.user.create({
      data: {
        email: "orga@test.com",
        password: await bcrypt.hash("orga123", 10),
        name: "Lucas Organisateur",
        role: "ORGANIZER",
        company: "Run Events SARL",
        phone: "+33 6 98 76 54 32",
      },
    });

    // Seed events
    await prisma.event.create({
      data: {
        id: "seed-event-1",
        name: "Marathon de Paris 2026",
        date: new Date("2026-04-12"),
        location: "Paris, France",
        userId: photographer.id,
      },
    });

    await prisma.event.create({
      data: {
        id: "seed-event-2",
        name: "Trail du Mont-Blanc 2026",
        date: new Date("2026-06-28"),
        location: "Chamonix, France",
        userId: organizer.id,
      },
    });

    return NextResponse.json({
      message: "Database seeded successfully",
      seeded: true,
      users: [admin.email, photographer.email, runner.email, organizer.email],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
