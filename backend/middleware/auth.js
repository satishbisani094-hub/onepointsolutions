const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'ops_logistics_jwt_secret_key_2026_super_secure';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    // Check if the user is an Admin
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Admins can access this portal.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
