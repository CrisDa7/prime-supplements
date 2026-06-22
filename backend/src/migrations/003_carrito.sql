-- Agregar columna descripcion e items (JSONB) a ventas para carrito multi-producto

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT '';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Migrar registros existentes (un solo producto) al nuevo formato items
UPDATE ventas
SET items = jsonb_build_array(
  jsonb_build_object(
    'producto_id', producto_id,
    'producto_nombre', COALESCE((SELECT nombre FROM productos WHERE id = producto_id), ''),
    'producto_sabor', COALESCE((SELECT sabor FROM productos WHERE id = producto_id), ''),
    'cantidad', cantidad,
    'precio_unitario', CASE WHEN cantidad > 0 THEN ROUND((total / cantidad)::numeric, 2) ELSE 0 END,
    'subtotal', total
  )
)
WHERE items = '[]'::jsonb OR items IS NULL;
