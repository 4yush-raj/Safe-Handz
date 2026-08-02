require('dotenv').config();
const prisma = require('./prismaClient');

async function main() {
  await prisma.$connect();
  const users = await prisma.user.findMany({
    include: { customerProfile: true }
  });
  console.log("=== Users & Customer Profiles ===");
  for (const u of users) {
    console.log(`User: ${u.email}, Role: ${u.role}, CustomerProfile ID: ${u.customerProfile?.id}`);
  }

  const docs = await prisma.document.findMany({
    include: { customer: true }
  });
  console.log("=== Documents ===");
  for (const d of docs) {
    console.log(`Doc ID: ${d.id}, FileName: ${d.fileName}, Doc Customer ID: ${d.customerId}, Doc Customer Owner Email: ${d.customer?.email}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
