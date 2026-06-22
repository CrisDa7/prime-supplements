const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;
    let sql = 'SELECT * FROM movimientos WHERE user_id = $1';
    const params = [req.userId];

    if (tipo === 'ingreso' || tipo === 'egreso') {
      sql += ' AND tipo = $2';
      params.push(tipo);
    }

    sql += ' ORDER BY fecha DESC LIMIT 100';

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
});

module.exports = router;
