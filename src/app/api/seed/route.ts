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

    // Seed admin only — no test users
    const admin = await prisma.user.create({
      data: {
        email: "admin@focusracer.com",
        password: await bcrypt.hash("Laurytal2", 10),
        name: "Admin Focus Racer",
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      message: "Database seeded successfully",
      seeded: true,
      users: [admin.email],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
