const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT v.*, p.nombre as producto_nombre, p.sabor as producto_sabor
       FROM ventas v
       JOIN productos p ON p.id = v.producto_id
       WHERE v.user_id = $1
       ORDER BY v.fecha DESC
       LIMIT 50`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cliente, telefono, productoId, cantidad, precioVenta } = req.body;
    if (!cliente) return res.status(400).json({ error: 'Nombre del cliente requerido' });
    if (!productoId) return res.status(400).json({ error: 'Producto requerido' });
    if (!cantidad || cantidad < 1) return res.status(400).json({ error: 'Cantidad inválida' });

    const prodResult = await db.query(
      'SELECT * FROM productos WHERE id = $1 AND user_id = $2',
      [productoId, req.userId]
    );
    const prod = prodResult.rows[0];
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    if (prod.stock < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente. Disponible: ${prod.stock}` });
    }

    const precioUnitario = precioVenta ? parseFloat(precioVenta) : parseFloat(prod.venta);
    if (isNaN(precioUnitario) || precioUnitario < 0) {
      return res.status(400).json({ error: 'Precio inválido' });
    }
    const total = precioUnitario * cantidad;

    await db.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [cantidad, productoId]);

    const ventaResult = await db.query(
      `INSERT INTO ventas (user_id, cliente, telefono, producto_id, cantidad, total)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, cliente, telefono || '', productoId, cantidad, total]
    );

    await db.query(
      `INSERT INTO movimientos (user_id, tipo, descripcion, monto)
       VALUES ($1, 'ingreso', $2, $3)`,
      [req.userId, `Venta — ${cliente} (${prod.nombre} x${cantidad})`, total]
    );

    const venta = ventaResult.rows[0];
    venta.producto_nombre = prod.nombre;
    venta.producto_sabor = prod.sabor;

    res.status(201).json(venta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

module.exports = router;
