import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function EditarProductoModal({ producto, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre: '', sabor: '', compra: 0, venta: 0, minStock: 5 });
  const { showToast } = useToast();

  useEffect(() => {
    if (producto) {
      setForm({
        nombre: producto.nombre,
        sabor: producto.sabor || '',
        compra: producto.compra,
        venta: producto.venta,
        minStock: producto.min_stock,
      });
    }
  }, [producto]);

  if (!producto) return null;

  async function handleSave() {
    if (!form.nombre.trim()) return showToast('Nombre requerido', 'error');
    try {
      const res = await api.put(`/productos/${producto.id}`, form);
      onSaved(res.data);
      onClose();
      showToast('Producto actualizado');
    } catch {
      showToast('Error al actualizar producto', 'error');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-7 w-[540px] max-w-[95vw]">
        <h3 className="text-[15px] font-bold text-[#ddd] mb-4">Editar producto</h3>
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#777] font-medium">Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="bg-[#111] border border-[#2a2a2a] text-[#ccc] px-3 py-2 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#777] font-medium">Sabor</label>
            <input
              value={form.sabor}
              onChange={(e) => setForm({ ...form, sabor: e.target.value })}
              className="bg-[#111] border border-[#2a2a2a] text-[#ccc] px-3 py-2 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#777] font-medium">P. Compra ($) *</label>
            <input
              type="number" step="0.01"
              value={form.compra}
              onChange={(e) => setForm({ ...form, compra: parseFloat(e.target.value) || 0 })}
              className="bg-[#111] border border-[#2a2a2a] text-[#ccc] px-3 py-2 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#777] font-medium">P. Venta ($) *</label>
            <input
              type="number" step="0.01"
              value={form.venta}
              onChange={(e) => setForm({ ...form, venta: parseFloat(e.target.value) || 0 })}
              className="bg-[#111] border border-[#2a2a2a] text-[#ccc] px-3 py-2 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#777] font-medium">Stock mínimo</label>
            <input
              type="number"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 5 })}
              className="bg-[#111] border border-[#2a2a2a] text-[#ccc] px-3 py-2 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
            />
          </div>
        </div>
        <div className="flex gap-2.5 justify-end mt-4">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}
