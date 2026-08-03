const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
let prisma = null;

if (connectionString) {
  try {
    const cleanConnectionString = connectionString.split('?')[0];
    const pool = new Pool({
      connectionString: cleanConnectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    prisma.dbAvailable = false;

    prisma.checkConnection = async function() {
      if (this.dbAvailable) return true;
      try {
        await this.$queryRaw`SELECT 1`;
        this.dbAvailable = true;
        console.log('Prisma database connection established.');
        return true;
      } catch (err) {
        this.dbAvailable = false;
        console.warn('Prisma database connection check failed:', err.message);
        return false;
      }
    };

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
