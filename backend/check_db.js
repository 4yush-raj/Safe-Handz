require('dotenv').config();
const prisma = require('./prismaClient');

async function main() {
  console.log("Checking DB connection...");
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  if (!prisma) {
    console.error("Prisma client is null!");
    return;
  }
  try {
    await prisma.$connect();
    console.log("Prisma connection success!");
    console.log("dbAvailable status:", prisma.dbAvailable);
    const count = await prisma.user.count();
    console.log("User count in DB:", count);
    const docs = await prisma.document.findMany();
    console.log("Document count in DB:", docs.length);
    console.log("Documents:", docs);
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
