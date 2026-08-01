const jwt = require('jsonwebtoken');

// Verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key');
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Role-Based Authorization Guard
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Requires one of the following roles: [${allowedRoles.join(', ')}]` 
      });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };