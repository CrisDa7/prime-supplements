const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

function isAdmin(req) {
  return req.userRol === 'administrador';
}

router.get('/', async (req, res) => {
  try {
    let sql, params;
    if (isAdmin(req)) {
      sql = `SELECT sh.*, p.nombre as producto_nombre
             FROM stock_historial sh
             JOIN productos p ON p.id = sh.producto_id
             ORDER BY sh.fecha DESC
             LIMIT 50`;
      params = [];
    } else {
      sql = `SELECT sh.*, p.nombre as producto_nombre
             FROM stock_historial sh
             JOIN productos p ON p.id = sh.producto_id
             WHERE sh.user_id = $1
             ORDER BY sh.fecha DESC
             LIMIT 50`;
      params = [req.userId];
    }
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial de stock' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productoId, cantidad, precio, nota } = req.body;
    if (!productoId) return res.status(400).json({ error: 'Producto requerido' });
    if (!cantidad || cantidad < 1) return res.status(400).json({ error: 'Cantidad inválida' });
    if (precio === undefined || precio < 0) return res.status(400).json({ error: 'Precio inválido' });

    let sql, params;
    if (isAdmin(req)) {
      sql = 'SELECT * FROM productos WHERE id = $1';
      params = [productoId];
    } else {
      sql = 'SELECT * FROM productos WHERE id = $1 AND user_id = $2';
      params = [productoId, req.userId];
    }
    const prodResult = await db.query(sql, params);
    const prod = prodResult.rows[0];
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    await db.query(
      'UPDATE productos SET stock = stock + $1, compra = $2, updated_at = NOW() WHERE id = $3',
      [cantidad, precio, productoId]
    );

    await db.query(
      `INSERT INTO stock_historial (user_id, producto_id, cantidad, precio, nota)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.userId, productoId, cantidad, precio, nota || '']
    );

    const total = parseFloat(precio) * cantidad;
    await db.query(
      `INSERT INTO movimientos (user_id, tipo, descripcion, monto)
       VALUES ($1, 'egreso', $2, $3)`,
      [req.userId, `Compra stock — ${prod.nombre} x${cantidad}${nota ? ' (' + nota + ')' : ''}`, total]
    );

    const updated = await db.query('SELECT * FROM productos WHERE id = $1', [productoId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
});

module.exports = router;
