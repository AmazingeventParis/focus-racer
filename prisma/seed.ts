import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin only — no test users
  const admin = await prisma.user.upsert({
    where: { email: "admin@focusracer.com" },
    update: {},
    create: {
      email: "admin@focusracer.com",
      password: await bcrypt.hash("Laurytal2", 10),
      name: "Admin Focus Racer",
      role: UserRole.ADMIN,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // Test users (dev / staging only)
  const testUsers = [
    {
      email: "photographe@test.com",
      password: "photo123",
      name: "Photographe Test",
      role: UserRole.PHOTOGRAPHER,
    },
    {
      email: "coureur@test.com",
      password: "runner123",
      name: "Coureur Test",
      role: UserRole.RUNNER,
    },
    {
      email: "orga@test.com",
      password: "orga123",
      name: "Organisateur Test",
      role: UserRole.ORGANIZER,
    },
  ];

  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        name: u.name,
        role: u.role,
      },
    });
    console.log(`Test user created: ${user.email} (${user.role})`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
