require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function runMigrations() {
  const migrationFiles = ['001_init.sql', '002_add_rol.sql', '003_carrito.sql', '004_alimentos.sql']
    .sort()
    .filter(f => fs.existsSync(path.join(__dirname, f)));

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`✓ Migration ${file} executed successfully`);
    } catch (err) {
      console.error(`Migration ${file} failed:`, err.message);
    }
  }

  await pool.end();
}

runMigrations();
