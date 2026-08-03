const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
let prisma = null;

if (connectionString) {
  try {
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    prisma.dbAvailable = false;

    prisma.$connect()
      .then(() => prisma.$queryRaw`SELECT 1`)
      .then(() => {
        prisma.dbAvailable = true;
        console.log('Prisma database connection established.');
      })
      .catch((err) => {
        prisma.dbAvailable = false;
        console.warn('Prisma database connection failed (using fallback):', err.message);
      });
  } catch (err) {
    console.warn('Prisma client initialization failed (will use fallback):', err.message);
    prisma = null;
  }
} else {
  console.warn('DATABASE_URL not configured; Prisma database access disabled.');
}

module.exports = prisma;
