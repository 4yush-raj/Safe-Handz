const prisma = require('../prismaClient');
const fs = require('fs');
const path = require('path');

const FALLBACK_PATH = path.join(__dirname, '..', 'data', 'fallback.json');

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

// Get Profile for current logged-in user
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (prisma?.dbAvailable) {
      try {
        let customer = await prisma.customer.findUnique({
          where: { userId },
          include: { user: true }
        });
        if (!customer) {
          // Dynamically create a profile if user exists (useful for agents/admins)
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            customer = await prisma.customer.create({
              data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                dob: new Date('1990-01-01'),
                phone: '0000000000',
                address: 'Enter address...'
              },
              include: { user: true }
            });
          }
        }
        if (!customer) {
          return res.status(404).json({ message: 'Profile not found.' });
        }
        return res.status(200).json(customer);
      } catch (dbErr) {
        console.warn('DB query failed for profile, using fallback:', dbErr.message);
      }
    }

    // Fallback file-based profile retrieval
    const store = loadFallback();
    let customer = store.customers.find(c => c.userId === userId);
    if (!customer) {
      const fbUser = store.users.find(u => u.id === userId);
      if (fbUser) {
        customer = {
          id: `cust_${Date.now()}`,
          userId: userId,
          name: fbUser.name,
          email: fbUser.email,
          dob: new Date('1990-01-01').toISOString(),
          phone: '0000000000',
          address: 'Enter address...',
          createdAt: new Date().toISOString()
        };
        store.customers.push(customer);
        saveFallback(store);
      }
    }
    if (!customer) {
      return res.status(404).json({ message: 'Profile not found (fallback).' });
    }
    // Mix in the user details if needed
    const user = store.users.find(u => u.id === userId);
    return res.status(200).json({
      ...customer,
      user: user ? { name: user.name, email: user.email } : null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update Profile for current logged-in user
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, dob, phone, address } = req.body;

    if (prisma?.dbAvailable) {
      try {
        let customer = await prisma.customer.findUnique({ where: { userId } });
        if (!customer) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            customer = await prisma.customer.create({
              data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                dob: new Date('1990-01-01'),
                phone: '0000000000',
                address: 'Enter address...'
              }
            });
          }
        }

        // Update user name first if provided
        if (name) {
          await prisma.user.update({
            where: { id: userId },
            data: { name }
          });
        }

        // Update customer details
        const updatedCustomer = await prisma.customer.update({
          where: { userId },
          data: {
            name: name || undefined,
            dob: dob ? new Date(dob) : undefined,
            phone: phone !== undefined ? phone : undefined,
            address: address !== undefined ? address : undefined
          },
          include: { user: true }
        });

        return res.status(200).json({
          message: 'Profile updated successfully',
          profile: updatedCustomer
        });
      } catch (dbErr) {
        console.warn('DB update failed for profile, using fallback:', dbErr.message);
      }
    }

    // Fallback file-based profile update
    const store = loadFallback();
    let customerIndex = store.customers.findIndex(c => c.userId === userId);
    if (customerIndex === -1) {
      const fbUser = store.users.find(u => u.id === userId);
      if (fbUser) {
        const newCustomer = {
          id: `cust_${Date.now()}`,
          userId: userId,
          name: fbUser.name,
          email: fbUser.email,
          dob: new Date('1990-01-01').toISOString(),
          phone: '0000000005',
          address: 'Enter address...',
          createdAt: new Date().toISOString()
        };
        store.customers.push(newCustomer);
        customerIndex = store.customers.length - 1;
      }
    }
    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Customer profile not found (fallback).' });
    }

    // Update User name
    if (name) {
      const userIndex = store.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        store.users[userIndex].name = name;
      }
      store.customers[customerIndex].name = name;
    }

    if (dob) store.customers[customerIndex].dob = dob;
    if (phone !== undefined) store.customers[customerIndex].phone = phone;
    if (address !== undefined) store.customers[customerIndex].address = address;

    saveFallback(store);

    const user = store.users.find(u => u.id === userId);

    return res.status(200).json({
      message: 'Profile updated successfully (fallback)',
      profile: {
        ...store.customers[customerIndex],
        user: user ? { name: user.name, email: user.email } : null
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all customers (ADMIN or AGENT only)
exports.getAllCustomers = async (req, res) => {
  try {
    if (prisma?.dbAvailable) {
      try {
        const customers = await prisma.customer.findMany({
          where: {
            user: {
              role: 'CUSTOMER'
            }
          },
          orderBy: { name: 'asc' },
          include: { user: true }
        });
        return res.status(200).json(customers);
      } catch (dbErr) {
        console.warn('DB query failed for all customers, using fallback:', dbErr.message);
      }
    }

    const store = loadFallback();
    const customers = (store.customers || []).filter(c => {
      const u = store.users.find(user => user.id === c.userId);
      return u && u.role === 'CUSTOMER';
    });
    return res.status(200).json(customers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all agents (ADMIN only)
exports.getAllAgents = async (req, res) => {
  try {
    if (prisma?.dbAvailable) {
      try {
        const agents = await prisma.user.findMany({
          where: { role: 'AGENT' },
          orderBy: { name: 'asc' },
          include: {
            customerProfile: true
          }
        });
        return res.status(200).json(agents);
      } catch (dbErr) {
        console.warn('DB query failed for all agents, using fallback:', dbErr.message);
      }
    }

    const store = loadFallback();
    const agents = (store.users || []).filter(u => u.role === 'AGENT').map(u => {
      const profile = store.customers.find(c => c.userId === u.id) || {};
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        customerProfile: {
          dob: profile.dob || '1990-01-01',
          phone: profile.phone || '0000000000',
          address: profile.address || 'Default Address'
        }
      };
    });
    return res.status(200).json(agents);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

