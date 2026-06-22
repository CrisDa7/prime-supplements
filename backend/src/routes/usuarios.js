const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, nombre, rol, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, nombre, rol) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, rol, created_at',
      [email, hash, nombre, rol || 'administrador']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está en uso' });
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET nombre = $1, email = $2, password_hash = $3, rol = $4 WHERE id = $5',
        [nombre, email, hash, rol || 'administrador', id]
      );
    } else {
      await db.query(
        'UPDATE users SET nombre = $1, email = $2, rol = $3 WHERE id = $4',
        [nombre, email, rol || 'administrador', id]
      );
    }

    const result = await db.query('SELECT id, email, nombre, rol, created_at FROM users WHERE id = $1', [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;