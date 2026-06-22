const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const ventaRoutes = require('./routes/ventas');
const movimientoRoutes = require('./routes/movimientos');
const stockRoutes = require('./routes/stock');
const usuarioRoutes = require('./routes/usuarios');
const alimentoRoutes = require('./routes/alimentos');

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`Prime Supplements API running on port ${PORT}`);
});
