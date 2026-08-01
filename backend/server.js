const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const documentRoutes = require('./routes/documentRoutes');
const claimRoutes = require('./routes/claimRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 2. Serve static uploaded files (Accessible via http://localhost:5000/uploads/filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Insurance Platform API Running' });
});

// Global Multer Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large! Maximum allowed size is 5MB.' });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;