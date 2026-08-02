require('dotenv').config();
const prisma = require('./prismaClient');

async function main() {
  await prisma.$connect();
  const policies = await prisma.policy.findMany({ select: { id: true } });
  console.log("=== Policy IDs in DB ===");
  policies.forEach(p => console.log(p.id));

  const docs = await prisma.document.findMany({ select: { id: true } });
  console.log("=== Doc IDs in DB ===");
  docs.forEach(d => console.log(d.id));
}

main().finally(() => prisma.$disconnect());
