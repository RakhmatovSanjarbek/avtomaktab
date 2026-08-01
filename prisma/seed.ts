// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  await prisma.user.upsert({
    where: { phone: "+998900000001" },
    update: {},
    create: {
      phone: "+998900000001",
      passwordHash: adminPassword,
      fullName: "Admin Administratorov",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { phone: "+998900000002" },
    update: {},
    create: {
      phone: "+998900000002",
      passwordHash: studentPassword,
      fullName: "Test O'quvchi",
      groupName: "101-guruh",
      role: "STUDENT",
    },
  });

  console.log("✅ Seed muvaffaqiyatli bajarildi");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });