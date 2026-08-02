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
  const policy = await prisma.policy.findFirst({
    where: { status: 'ACTIVE' },
    include: { customer: true }
  });
  
  if (!policy) {
    console.log("No active policy found in DB");
    return;
  }
  
  console.log(`Found active policy ID: ${policy.id}, Customer email: ${policy.customer.email}`);

  const user = await prisma.user.findFirst({
    where: { role: 'CUSTOMER', email: policy.customer.email }
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
    port: 5173, // Vite dev server port
    path: `/api/policies/${policy.id}/download`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    const fileStream = fs.createWriteStream('test_policy_via_proxy.pdf');
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('Policy certificate download finished.');
      const stats = fs.statSync('test_policy_via_proxy.pdf');
      console.log(`Downloaded policy file size: ${stats.size} bytes`);
      
      // Check first 20 bytes
      const fd = fs.openSync('test_policy_via_proxy.pdf', 'r');
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
