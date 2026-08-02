require('dotenv').config();
const prisma = require('./prismaClient');

async function main() {
  await prisma.$connect();
  
  const users = await prisma.user.findMany();
  console.log("=== USERS ===");
  users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`));
  
  const customers = await prisma.customer.findMany();
  console.log("\n=== CUSTOMERS ===");
  customers.forEach(c => console.log(`ID: ${c.id}, Email: ${c.email}, UserID: ${c.userId}, Name: ${c.name}`));
  
  const docs = await prisma.document.findMany();
  console.log("\n=== DOCUMENTS ===");
  docs.forEach(d => console.log(`ID: ${d.id}, CustomerID: ${d.customerId}, Name: ${d.fileName}, Path: ${d.filePath}`));
  
  const policies = await prisma.policy.findMany();
  console.log("\n=== POLICIES ===");
  policies.forEach(p => console.log(`ID: ${p.id}, CustomerID: ${p.customerId}, Type: ${p.policyType}, Status: ${p.status}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
