const fs = require('fs');
const http = require('http');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.log("No DATABASE_URL configured");
  process.exit(1);
}

const prisma = require('./prismaClient');
const jwt = require('jsonwebtoken');

async function run() {
  await prisma.$connect();
  const docId = '7f487b2c-3d91-4b01-872c-be4c07366953';
  const doc = await prisma.document.findUnique({ where: { id: docId }, include: { customer: true } });
  if (!doc) {
    console.log("Document not found");
    return;
  }
  
  const user = await prisma.user.findFirst({
    where: { role: 'CUSTOMER', email: doc.customer.email }
  });
  
  if (!user) {
    console.log("Customer user not found");
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log(`Generated token for user ${user.email} (ID: ${user.id})`);
  await prisma.$disconnect();

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/documents/${docId}/download?token=${token}`,
    method: 'GET',
    headers: {}
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    const fileStream = fs.createWriteStream('test_downloaded.pdf');
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('File download finished.');
      const stats = fs.statSync('test_downloaded.pdf');
      console.log(`Downloaded file size: ${stats.size} bytes`);
      
      // Check first 20 bytes
      const fd = fs.openSync('test_downloaded.pdf', 'r');
      const buf = Buffer.alloc(20);
      fs.readSync(fd, buf, 0, 20, 0);
      fs.closeSync(fd);
      console.log(`Header hex: ${buf.toString('hex')}`);
      console.log(`Header string: ${buf.toString('utf8')}`);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
}

run().catch(console.error);
