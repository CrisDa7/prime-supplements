require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, '001_init.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✓ Migration 001_init.sql executed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigrations();
