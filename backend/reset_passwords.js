require('dotenv').config();
const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');

async function main() {
  await prisma.$connect();

  const hashedGoku = await bcrypt.hash('password', 10);
  const hashedTest = await bcrypt.hash('Password123', 10);

  await prisma.user.updateMany({
    where: { email: 'goko@gmail.com' },
    data: { password: hashedGoku }
  });

  await prisma.user.updateMany({
    where: { email: 'testcustomer@example.com' },
    data: { password: hashedTest }
  });

  await prisma.user.updateMany({
    where: { email: 'testadmin@example.com' },
    data: { password: hashedTest }
  });

  await prisma.user.updateMany({
    where: { email: 'testagent@example.com' },
    data: { password: hashedTest }
  });

  console.log("Passwords updated successfully in DB!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
