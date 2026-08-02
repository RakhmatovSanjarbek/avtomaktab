import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as readline from "readline/promises";
import { stdin, stdout } from "process";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("=== Avtomaktab — Super Admin yaratish ===\n");

  const fullName = await rl.question("To'liq ism: ");
  const phone = await rl.question("Telefon raqam (masalan +998901234567): ");
  const email = await rl.question("Email (ixtiyoriy, parol tiklash uchun kerak, bo'sh qoldirish mumkin): ");
  const password = await rl.question("Parol: ");

  rl.close();

  if (!fullName.trim() || !phone.trim() || !password.trim()) {
    console.error("\n❌ Ism, telefon va parol majburiy.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { phone: phone.trim() } });
  if (existing) {
    console.error("\n❌ Bu telefon raqam bilan foydalanuvchi allaqachon mavjud.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`\n✅ Super admin yaratildi: ${admin.fullName} (${admin.phone})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
