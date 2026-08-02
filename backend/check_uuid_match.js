require('dotenv').config();
const prisma = require('./prismaClient');

async function main() {
  await prisma.$connect();
  const policy1 = await prisma.policy.findUnique({
    where: { id: '1ea760cf-d652-4ca8-9e71-1b884e14b850' }
  });
  console.log("Policy 1ea760cf:", policy1);

  const policy2 = await prisma.policy.findUnique({
    where: { id: '49d02df4-25bb-4816-9352-582982f629c9' }
  });
  console.log("Policy 49d02df4:", policy2);

  const doc1 = await prisma.document.findUnique({
    where: { id: '1ea760cf-d652-4ca8-9e71-1b884e14b850' }
  });
  console.log("Doc 1ea760cf:", doc1);

  const doc2 = await prisma.document.findUnique({
    where: { id: '49d02df4-25bb-4816-9352-582982f629c9' }
  });
  console.log("Doc 49d02df4:", doc2);
}

main().finally(() => prisma.$disconnect());
