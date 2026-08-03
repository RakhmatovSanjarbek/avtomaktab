import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as readline from "readline/promises";
import { stdin, stdout } from "process";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const phone = await rl.question("Super admin qilinadigan telefon raqam: ");
  rl.close();

  const user = await prisma.user.findUnique({ where: { phone: phone.trim() } });
  if (!user) {
    console.error("❌ Bunday telefon raqamli foydalanuvchi topilmadi.");
    process.exit(1);
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: "SUPER_ADMIN" } });
  console.log(`✅ ${user.fullName} endi SUPER_ADMIN.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
