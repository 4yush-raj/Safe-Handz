require('dotenv').config();
const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function main() {
  await prisma.$connect();
  const user = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' }
  });
  if (!user) {
    console.log("No customer user found");
    return;
  }
  console.log("Found Customer User:", user.email);

  // Generate a valid JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '24h' }
  );

  console.log("JWT Token generated.");

  // Let's test the downloadDocument controller logic directly!
  const req = {
    params: { documentId: '7f487b2c-3d91-4b01-872c-be4c07366953' },
    user: { id: user.id, email: user.email, role: user.role }
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log(`JSON Response (status ${this.statusCode || 200}):`, data);
      return this;
    },
    download(filePath, name) {
      console.log(`Download Response called: filePath=${filePath}, name=${name}`);
      return this;
    }
  };

  const { downloadDocument } = require('./documentcontroller');
  console.log("Executing downloadDocument controller directly...");
  await downloadDocument(req, res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
