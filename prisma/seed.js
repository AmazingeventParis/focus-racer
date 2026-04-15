const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

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
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

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
