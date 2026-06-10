import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

// Passwords come from env vars — never hardcode credentials in a public repo.
// If a password is not provided, a random one is generated and printed once.
function resolvePassword(envVar: string, label: string): string {
  const fromEnv = process.env[envVar];
  if (fromEnv) return fromEnv;
  const generated = crypto.randomBytes(12).toString("base64url");
  console.log(`[seed] ${envVar} non défini — mot de passe généré pour ${label}: ${generated}`);
  return generated;
}

async function main() {
  console.log("Seeding database...");

  // Admin — upsert with update:{} so an existing admin password is never overwritten
  const admin = await prisma.user.upsert({
    where: { email: "admin@focusracer.com" },
    update: {},
    create: {
      email: "admin@focusracer.com",
      password: await bcrypt.hash(resolvePassword("SEED_ADMIN_PASSWORD", "admin"), 10),
      name: "Admin Focus Racer",
      role: UserRole.ADMIN,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // Test users (dev / staging only — skipped in production)
  if (process.env.NODE_ENV === "production") {
    console.log("Production environment: skipping test users.");
  } else {
    const testUsers = [
      {
        email: "photographe@test.com",
        envVar: "SEED_PHOTOGRAPHER_PASSWORD",
        name: "Photographe Test",
        role: UserRole.PHOTOGRAPHER,
      },
      {
        email: "coureur@test.com",
        envVar: "SEED_RUNNER_PASSWORD",
        name: "Coureur Test",
        role: UserRole.RUNNER,
      },
      {
        email: "orga@test.com",
        envVar: "SEED_ORGANIZER_PASSWORD",
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
          password: await bcrypt.hash(resolvePassword(u.envVar, u.email), 10),
          name: u.name,
          role: u.role,
        },
      });
      console.log(`Test user created: ${user.email} (${user.role})`);
    }
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
