const jwt = require('jsonwebtoken');
const db = require('../db');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await db.query('SELECT id, rol FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Usuario no encontrado o eliminado' });
    }

    req.userId = decoded.id;
    req.userRol = result.rows[0].rol;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  if (req.userRol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
