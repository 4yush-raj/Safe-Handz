require('dotenv').config();
const prisma = require('./prismaClient');

async function main() {
  await prisma.$connect();
  const user = await prisma.user.findUnique({
    where: { email: 'testcustomer@example.com' }
  });
  console.log("testcustomer details:", user);
}

main().finally(() => prisma.$disconnect());
