-- Add rol column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS rol VARCHAR(50) NOT NULL DEFAULT 'administrador';
