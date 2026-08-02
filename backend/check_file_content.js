require('dotenv').config();
const prisma = require('./prismaClient');
const fs = require('fs');
const path = require('path');

async function main() {
  const docs = await prisma.document.findMany();
  console.log("Documents in DB:", docs.length);
  for (const doc of docs) {
    const fullPath = path.join(__dirname, doc.filePath);
    const exists = fs.existsSync(fullPath);
    console.log(`ID: ${doc.id}, Name: ${doc.fileName}, Path: ${doc.filePath}, Absolute Path: ${fullPath}, Physical File Exists: ${exists}`);
    if (exists) {
      const stats = fs.statSync(fullPath);
      console.log(`  Size on disk: ${stats.size} bytes`);
      // read first 20 bytes
      const fd = fs.openSync(fullPath, 'r');
      const buf = Buffer.alloc(20);
      fs.readSync(fd, buf, 0, 20, 0);
      fs.closeSync(fd);
      console.log(`  Header bytes (hex): ${buf.toString('hex')}`);
      console.log(`  Header string: ${buf.toString('utf8')}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
