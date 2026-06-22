const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

function isAdmin(req) {
  return req.userRol === 'administrador';
}

router.get('/', async (req, res) => {
  try {
    let sql, params;
    if (isAdmin(req)) {
      sql = 'SELECT * FROM productos ORDER BY created_at DESC';
      params = [];
    } else {
      sql = 'SELECT * FROM productos WHERE user_id = $1 ORDER BY created_at DESC';
      params = [req.userId];
    }
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let sql, params;
    if (isAdmin(req)) {
      sql = 'SELECT * FROM productos WHERE id = $1';
      params = [req.params.id];
    } else {
      sql = 'SELECT * FROM productos WHERE id = $1 AND user_id = $2';
      params = [req.params.id, req.userId];
    }
    const result = await db.query(sql, params);
    if (!result.rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, sabor, compra, venta, stock, minStock } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    const result = await db.query(
      `INSERT INTO productos (user_id, nombre, sabor, compra, venta, stock, min_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.userId, nombre, sabor || '', compra || 0, venta || 0, stock || 0, minStock || 5]
    );

    const prod = result.rows[0];

    if (stock > 0 && compra > 0) {
      const total = compra * stock;
      await db.query(
        `INSERT INTO movimientos (user_id, tipo, descripcion, monto) VALUES ($1, 'egreso', $2, $3)`,
        [req.userId, `Compra inicial — ${nombre} x${stock}`, total]
      );
      await db.query(
        `INSERT INTO stock_historial (user_id, producto_id, cantidad, precio, nota)
         VALUES ($1, $2, $3, $4, 'Stock inicial')`,
        [req.userId, prod.id, stock, compra]
      );
    }

    res.status(201).json(prod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nombre, sabor, compra, venta, minStock } = req.body;
    let sql, params;
    if (isAdmin(req)) {
      sql = `UPDATE productos SET nombre = $1, sabor = $2, compra = $3, venta = $4,
             min_stock = $5, updated_at = NOW()
             WHERE id = $6 RETURNING *`;
      params = [nombre, sabor || '', compra, venta, minStock || 5, req.params.id];
    } else {
      sql = `UPDATE productos SET nombre = $1, sabor = $2, compra = $3, venta = $4,
             min_stock = $5, updated_at = NOW()
             WHERE id = $6 AND user_id = $7 RETURNING *`;
      params = [nombre, sabor || '', compra, venta, minStock || 5, req.params.id, req.userId];
    }
    const result = await db.query(sql, params);
    if (!result.rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let sql, params;
    if (isAdmin(req)) {
      sql = 'DELETE FROM productos WHERE id = $1 RETURNING id';
      params = [req.params.id];
    } else {
      sql = 'DELETE FROM productos WHERE id = $1 AND user_id = $2 RETURNING id';
      params = [req.params.id, req.userId];
    }
    const result = await db.query(sql, params);
    if (!result.rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
