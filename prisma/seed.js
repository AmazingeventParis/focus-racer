const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const isProduction = process.env.NODE_ENV === "production";

// Passwords come from env vars — never hardcode credentials in a public repo.
// Without an env var, a random password is generated and printed once (dev only).
function resolvePassword(envVar, label) {
  const fromEnv = process.env[envVar];
  if (fromEnv) return fromEnv;
  const generated = crypto.randomBytes(12).toString("base64url");
  console.log(`[seed] ${envVar} non defini — mot de passe genere pour ${label}: ${generated}`);
  return generated;
}

const TEST_EMAILS = ["photographe@test.com", "coureur@test.com", "orga@test.com"];

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
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  if (isProduction) {
    // Production: never create test accounts. Deactivate any that exist from
    // earlier seeds — their passwords were committed to a public repo.
    const deactivated = await prisma.user.updateMany({
      where: { email: { in: TEST_EMAILS }, isActive: true },
      data: { isActive: false, credits: 0 },
    });
    if (deactivated.count > 0) {
      console.log(`[seed] Production: ${deactivated.count} compte(s) de test desactive(s)`);
    }
    console.log("Seeding completed (production mode)!");
    return;
  }

  // Dev/staging test users
  const photographer = await prisma.user.upsert({
    where: { email: "photographe@test.com" },
    update: { credits: 999999 },
    create: {
      email: "photographe@test.com",
      password: await bcrypt.hash(resolvePassword("SEED_PHOTOGRAPHER_PASSWORD", "photographe@test.com"), 10),
      name: "Pierre Photo",
      role: "PHOTOGRAPHER",
      company: "Photo Sport Pro",
      phone: "+33 6 12 34 56 78",
      credits: 999999,
    },
  });
  console.log("Photographer created:", photographer.email);

  const runner = await prisma.user.upsert({
    where: { email: "coureur@test.com" },
    update: {},
    create: {
      email: "coureur@test.com",
      password: await bcrypt.hash(resolvePassword("SEED_RUNNER_PASSWORD", "coureur@test.com"), 10),
      name: "Marie Coureur",
      role: "RUNNER",
    },
  });
  console.log("Runner created:", runner.email);

  const organizer = await prisma.user.upsert({
    where: { email: "orga@test.com" },
    update: {},
    create: {
      email: "orga@test.com",
      password: await bcrypt.hash(resolvePassword("SEED_ORGANIZER_PASSWORD", "orga@test.com"), 10),
      name: "Lucas Organisateur",
      role: "ORGANIZER",
      company: "Run Events SARL",
      phone: "+33 6 98 76 54 32",
    },
  });
  console.log("Organizer created:", organizer.email);

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
