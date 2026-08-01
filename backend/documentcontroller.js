const prisma = require('./prismaClient');
const path = require('path');
const fs = require('fs');

// Upload Customer Identity / Policy Document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    let customerId = req.body.customerId;

    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });
      customerId = customer.id;
    }

    if (!customerId) {
      return res.status(400).json({ message: 'customerId is required.' });
    }

    const relativePath = path.join('uploads', req.file.filename);

    const document = await prisma.document.create({
      data: {
        customerId,
        fileName: req.file.originalname,
        filePath: relativePath,
      },
    });

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Documents List for a Customer
exports.getCustomerDocuments = async (req, res) => {
  try {
    let customerId = req.params.customerId;

    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });
      customerId = customer.id;
    }

    const documents = await prisma.document.findMany({
      where: { customerId },
      orderBy: { uploadedAt: 'desc' },
    });

    return res.status(200).json(documents);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Securely Download / Stream Uploaded File
exports.downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      return res.status(404).json({ message: 'Document record not found.' });
    }

    // Role Guard: Customers can only download their own documents
    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer || document.customerId !== customer.id) {
        return res.status(403).json({ message: 'Unauthorized to download this document.' });
      }
    }

    const fullPath = path.join(__dirname, document.filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Physical file missing from server.' });
    }

    return res.download(fullPath, document.fileName);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};