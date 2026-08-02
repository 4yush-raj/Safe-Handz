const fs = require('fs').promises;
const path = require('path');
const prisma = require('../prismaClient');
const { randomUUID } = require('crypto');

const messagesFile = process.env.VERCEL
  ? path.join('/tmp', 'messages.json')
  : path.join(__dirname, '..', 'messages.json');

async function loadMessages() {
  try {
    const raw = await fs.readFile(messagesFile, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    return [];
  }
}

async function saveMessages(messages) {
  await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2), 'utf-8');
}

exports.sendMessage = async (req, res) => {
  try {
    const { content, customerId } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const senderRole = req.user.role;
    const senderId = req.user.id;
    let messageCustomerId = customerId;

    if (senderRole === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: senderId } });
      if (!customer) {
        return res.status(404).json({ message: 'Customer profile not found.' });
      }
      messageCustomerId = customer.id;
    } else {
      if (!messageCustomerId) {
        return res.status(400).json({ message: 'customerId is required when sending a message as an agent.' });
      }
    }

    const messages = await loadMessages();
    const message = {
      id: randomUUID(),
      customerId: messageCustomerId,
      senderId,
      senderRole,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    messages.push(message);
    await saveMessages(messages);

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await loadMessages();

    if (req.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!customer) {
        return res.status(404).json({ message: 'Customer profile not found.' });
      }
      const filtered = messages.filter((msg) => msg.customerId === customer.id);
      return res.status(200).json(filtered);
    }

    // Admins and agents can see all customer-related messages
    const filtered = messages.filter((msg) => Boolean(msg.customerId));
    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
