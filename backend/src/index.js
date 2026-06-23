const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { pool } = require('./db');

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const ventaRoutes = require('./routes/ventas');
const movimientoRoutes = require('./routes/movimientos');
const stockRoutes = require('./routes/stock');
const usuarioRoutes = require('./routes/usuarios');
const alimentoRoutes = require('./routes/alimentos');

const app = express();
const PORT = process.env.PORT || 3001;

async function runMigrations() {
  const migrationFiles = ['001_init.sql', '002_add_rol.sql', '003_carrito.sql', '004_alimentos.sql']
    .sort()
    .filter(f => fs.existsSync(path.join(__dirname, 'migrations', f)));

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`✓ Migration ${file} executed successfully`);
    } catch (err) {
      console.error(`Migration ${file} failed:`, err.message);
    }
  }
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/alimentos', alimentoRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function startServer() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`Prime Supplements API running on port ${PORT}`);
  });
}

startServer();
