const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const FALLBACK_PATH = process.env.VERCEL
  ? path.join('/tmp', 'fallback.json')
  : path.join(__dirname, '..', 'data', 'fallback.json');

function loadFallback() {
  try {
    if (!fs.existsSync(FALLBACK_PATH)) return { users: [], customers: [], policies: [], claims: [], payments: [] };
    const raw = fs.readFileSync(FALLBACK_PATH, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    return { users: [], customers: [], policies: [], claims: [], payments: [] };
  }
}

function saveFallback(data) {
  try {
    const dir = path.dirname(FALLBACK_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save fallback data', err);
  }
}

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Try DB-backed registration if Prisma client is available and healthy
    if (prisma?.dbAvailable) {
      try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User with this email already exists.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: { name, email, password: hashedPassword, role: role || 'CUSTOMER' }
        });

        if (user.role === 'CUSTOMER') {
          await prisma.customer.create({
            data: {
              userId: user.id,
              name: user.name,
              email: user.email,
              dob: req.body.dob ? new Date(req.body.dob) : new Date('1990-01-01'),
              phone: req.body.phone || '0000000000',
              address: req.body.address || 'Default Address'
            }
          });
        }

        return res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      } catch (dbErr) {
        console.warn('DB registration failed, falling back to file store:', dbErr?.message || dbErr);
      }
    } else {
      console.warn('Prisma database unavailable, using fallback storage for registration.');
    }

    // Fallback file-based registration
    const store = loadFallback();
    const existing = store.users.find((u) => u.email === email);
    if (existing) return res.status(400).json({ message: 'User with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `fb_${Date.now()}`;
    const newUser = { id, name, email, password: hashedPassword, role: role || 'CUSTOMER', createdAt: new Date().toISOString() };
    store.users.push(newUser);

    if (newUser.role === 'CUSTOMER') {
      const customer = {
        id: `cust_${Date.now()}`,
        userId: id,
        name,
        email,
        dob: req.body.dob ? new Date(req.body.dob).toISOString() : new Date('1990-01-01').toISOString(),
        phone: req.body.phone || '0000000000',
        address: req.body.address || 'Default Address',
        createdAt: new Date().toISOString()
      };
      store.customers.push(customer);
    }

    saveFallback(store);
    return res.status(201).json({ message: 'User registered (fallback storage)', user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Try DB-backed login if Prisma client is available and healthy
    if (prisma?.dbAvailable) {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          // fall through to fallback check
        } else {
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });
          const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'your_super_secret_key', { expiresIn: '24h' });
          return res.status(200).json({ message: 'Logged in successfully', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        }
      } catch (dbErr) {
        console.warn('DB login failed, will attempt fallback:', dbErr.message);
      }
    } else {
      console.warn('Prisma database unavailable, using fallback storage for login.');
    }

    // Fallback file-based login
    const store = loadFallback();
    const fbUser = store.users.find((u) => u.email === email);
    if (!fbUser) return res.status(400).json({ message: 'Invalid email or password.' });
    const validPassword = await bcrypt.compare(password, fbUser.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });
    const token = jwt.sign({ id: fbUser.id, role: fbUser.role, email: fbUser.email }, process.env.JWT_SECRET || 'your_super_secret_key', { expiresIn: '24h' });
    return res.status(200).json({ message: 'Logged in (fallback)', token, user: { id: fbUser.id, name: fbUser.name, email: fbUser.email, role: fbUser.role } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
