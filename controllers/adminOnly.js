function adminOnly(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
}

module.exports = adminOnly;