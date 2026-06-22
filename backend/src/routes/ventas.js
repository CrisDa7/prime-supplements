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
  const { cliente, telefono, descripcion, items } = req.body;

  if (!cliente) return res.status(400).json({ error: 'Nombre del cliente requerido' });
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un producto' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const itemsConDetalle = [];
    let totalGeneral = 0;

    for (const item of items) {
      const { productoId, cantidad, precioVenta } = item;
      if (!productoId) throw { status: 400, message: 'ID de producto requerido' };
      if (!cantidad || cantidad < 1) throw { status: 400, message: 'Cantidad inválida' };

      const prodResult = await client.query(
        'SELECT * FROM productos WHERE id = $1 AND user_id = $2',
        [productoId, req.userId]
      );
      const prod = prodResult.rows[0];
      if (!prod) throw { status: 404, message: `Producto ID ${productoId} no encontrado` };
      if (prod.stock < cantidad) {
        throw { status: 400, message: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}` };
      }

      const precioUnitario = precioVenta ? parseFloat(precioVenta) : parseFloat(prod.venta);
      if (isNaN(precioUnitario) || precioUnitario < 0) {
        throw { status: 400, message: `Precio inválido para "${prod.nombre}"` };
      }

      const subtotal = precioUnitario * cantidad;
      totalGeneral += subtotal;

      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [cantidad, productoId]
      );

      itemsConDetalle.push({
        producto_id: prod.id,
        producto_nombre: prod.nombre,
        producto_sabor: prod.sabor,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      });
    }

    const detalleStr = itemsConDetalle.map((i) => `${i.producto_nombre} x${i.cantidad}`).join(', ');
    const descripcionFinal = descripcion || '';

    const ventaResult = await client.query(
      `INSERT INTO ventas (user_id, cliente, telefono, descripcion, producto_id, cantidad, total, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.userId,
        cliente,
        telefono || '',
        descripcionFinal,
        itemsConDetalle[0].producto_id,
        itemsConDetalle[0].cantidad,
        totalGeneral,
        JSON.stringify(itemsConDetalle),
      ]
    );

    await client.query(
      `INSERT INTO movimientos (user_id, tipo, descripcion, monto)
       VALUES ($1, 'ingreso', $2, $3)`,
      [req.userId, `Venta — ${cliente} (${detalleStr})`, totalGeneral]
    );

    await client.query('COMMIT');

    const venta = ventaResult.rows[0];
    venta.items = itemsConDetalle;
    venta.producto_nombre = itemsConDetalle[0].producto_nombre;
    venta.producto_sabor = itemsConDetalle[0].producto_sabor;

    res.status(201).json(venta);
  } catch (err) {
    await client.query('ROLLBACK');
    const status = err.status || 500;
    const message = err.message || 'Error al registrar venta';
    console.error(err);
    res.status(status).json({ error: message });
  } finally {
    client.release();
  }
});

module.exports = router;
