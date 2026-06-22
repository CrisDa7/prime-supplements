-- Tabla de alimentos para la calculadora de dietas
CREATE TABLE IF NOT EXISTS alimentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  proteinas DECIMAL(6,2) NOT NULL DEFAULT 0,
  carbohidratos DECIMAL(6,2) NOT NULL DEFAULT 0,
  grasas DECIMAL(6,2) NOT NULL DEFAULT 0,
  calorias DECIMAL(6,2) NOT NULL DEFAULT 0,
  porcion_g DECIMAL(6,2) DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar alimentos base solo si la tabla esta vacia (valores por 100g)
INSERT INTO alimentos (nombre, categoria, proteinas, carbohidratos, grasas, calorias)
SELECT * FROM (VALUES
  ('Pechuga de pollo', 'proteina', 31.00, 0.00, 3.60, 165.00),
  ('Huevo entero', 'proteina', 13.00, 1.10, 11.00, 155.00),
  ('Clara de huevo', 'proteina', 11.00, 0.70, 0.00, 48.00),
  ('Atún en agua', 'proteina', 26.00, 0.00, 1.00, 116.00),
  ('Carne de res magra', 'proteina', 26.00, 0.00, 15.00, 250.00),
  ('Pescado blanco', 'proteina', 20.00, 0.00, 1.00, 90.00),
  ('Salmón', 'proteina', 20.00, 0.00, 13.00, 208.00),
  ('Lomo de cerdo', 'proteina', 27.00, 0.00, 14.00, 242.00),
  ('Queso fresco', 'proteina', 18.00, 1.30, 20.00, 260.00),
  ('Yogur griego', 'proteina', 10.00, 3.60, 0.70, 63.00),
  ('Arroz blanco', 'carbohidrato', 2.70, 28.00, 0.30, 130.00),
  ('Arroz integral', 'carbohidrato', 2.50, 23.00, 0.90, 111.00),
  ('Avena en hojuelas', 'carbohidrato', 13.50, 66.00, 6.50, 379.00),
  ('Papa', 'carbohidrato', 2.00, 17.00, 0.10, 77.00),
  ('Camote', 'carbohidrato', 1.60, 20.00, 0.05, 86.00),
  ('Pan integral', 'carbohidrato', 9.00, 49.00, 3.40, 265.00),
  ('Pasta de trigo', 'carbohidrato', 5.00, 25.00, 0.50, 126.00),
  ('Quinoa', 'carbohidrato', 4.40, 21.00, 1.90, 120.00),
  ('Plátano', 'carbohidrato', 1.10, 23.00, 0.30, 89.00),
  ('Lentejas cocidas', 'carbohidrato', 9.00, 20.00, 0.40, 116.00),
  ('Frijoles cocidos', 'carbohidrato', 8.70, 22.00, 0.50, 127.00),
  ('Aceite de oliva', 'grasa', 0.00, 0.00, 100.00, 884.00),
  ('Aguacate', 'grasa', 2.00, 9.00, 15.00, 160.00),
  ('Almendras', 'grasa', 21.00, 22.00, 50.00, 578.00),
  ('Maní', 'grasa', 26.00, 16.00, 49.00, 567.00),
  ('Semillas de chía', 'grasa', 17.00, 42.00, 31.00, 486.00),
  ('Mantequilla de maní', 'grasa', 25.00, 20.00, 50.00, 588.00),
  ('Brócoli', 'vegetal', 2.80, 7.00, 0.40, 35.00),
  ('Espinaca', 'vegetal', 2.90, 3.60, 0.40, 23.00),
  ('Zanahoria', 'vegetal', 0.90, 10.00, 0.20, 41.00),
  ('Tomate', 'vegetal', 0.90, 3.90, 0.20, 18.00),
  ('Lechuga', 'vegetal', 1.20, 2.90, 0.20, 15.00),
  ('Pepino', 'vegetal', 0.70, 3.60, 0.10, 16.00)
) AS new_vals
WHERE NOT EXISTS (SELECT 1 FROM alimentos LIMIT 1);
