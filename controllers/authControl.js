const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'your-secret-key';

function authMiddleware(req, res, next) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/token=([^;]+)/);

  if (!match) return res.status(401).json({ message: 'Missing token' });

  const token = match[1];
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });

    req.user = decoded; // { email, name, is_admin }
    next();
  });
}

module.exports = authMiddleware;
