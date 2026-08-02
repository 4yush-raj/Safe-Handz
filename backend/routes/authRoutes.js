const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.get('/', (req, res) => {
  return res.json({
    message: 'Auth API is live. Use POST /register to create an account and POST /login to log in.',
    routes: [
      { method: 'POST', path: '/api/auth/register' },
      { method: 'POST', path: '/api/auth/login' }
    ]
  });
});

router.get('/login', (req, res) => {
  return res.json({ message: 'Use POST /api/auth/login with { email, password } in the JSON body.' });
});

router.get('/register', (req, res) => {
  return res.json({ message: 'Use POST /api/auth/register with { name, email, password, role? } in the JSON body.' });
});

router.post('/register', register);
router.post('/login', login);

module.exports = router;
