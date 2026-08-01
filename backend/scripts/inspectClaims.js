const prisma = require('../prismaClient');

async function main() {
  try {
    const claims = await prisma.claim.findMany({ include: { policy: true } });
    console.log('Claims count:', claims.length);
    console.dir(claims, { depth: 4 });
  } catch (err) {
    console.error('Error querying claims:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
