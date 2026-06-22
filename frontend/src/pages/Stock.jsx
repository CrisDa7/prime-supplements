import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { formatMoney, formatDate } from '../lib/utils';
import { IconPackage, IconRefresh } from '@tabler/icons-react';

export default function Stock() {
  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [form, setForm] = useState({ productoId: '', cantidad: '', precio: '', nota: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get('/productos'), api.get('/stock')]).then(([pRes, hRes]) => {
      setProductos(pRes.data);
      setHistorial(hRes.data);
    }).catch(() => showToast('Error al cargar datos', 'error'));
  }, []);

  const selectedProd = productos.find((p) => p.id === parseInt(form.productoId));
  const bajos = productos.filter((p) => p.stock <= p.min_stock);
  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sabor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleActualizar() {
    if (!form.productoId) return showToast('Selecciona un producto', 'error');
    const cantidad = parseInt(form.cantidad);
    const precio = parseFloat(form.precio);
    if (!cantidad || cantidad < 1) return showToast('Cantidad inválida', 'error');
    if (isNaN(precio) || precio < 0) return showToast('Precio de compra inválido', 'error');

    try {
      await api.post('/stock', { productoId: parseInt(form.productoId), cantidad, precio, nota: form.nota });
      showToast(`Stock actualizado. ${selectedProd?.nombre}: ${(selectedProd?.stock || 0) + cantidad} unidades`);
      setSearchTerm('');
      setForm({ productoId: '', cantidad: '', precio: '', nota: '' });

      const [pRes, hRes] = await Promise.all([api.get('/productos'), api.get('/stock')]);
      setProductos(pRes.data);
      setHistorial(hRes.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al actualizar stock', 'error');
    }
  }

  return (
    <>
      <Topbar title="Actualizar Stock" subtitle="Añade inventario a tus productos" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <div>
            <h3 className="section-title">Agregar stock a producto existente</h3>
            <div className="card p-5">
              <div className="flex flex-col gap-1 mb-3.5 relative">
                <label className="text-xs text-[#777] font-medium">Producto *</label>
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (form.productoId) setForm({ ...form, productoId: '' });
                  }}
                  placeholder="Escribe al menos 3 caracteres para buscar..."
                  className="input"
                />
                {searchTerm.length >= 3 && !form.productoId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg max-h-48 overflow-y-auto z-10 shadow-xl">
                    {filteredProductos.length ? filteredProductos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, productoId: p.id.toString() });
                          setSearchTerm(`${p.nombre}${p.sabor ? ` (${p.sabor})` : ''}`);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-sm text-[#ccc] hover:bg-[#2a2a2a] border-b border-[#222] last:border-b-0"
                      >
                        {p.nombre}{p.sabor ? ` (${p.sabor})` : ''}
                        <span className="text-[#555] text-xs ml-2">Stock: {p.stock}</span>
                      </button>
                    )) : (
                      <div className="px-3.5 py-2.5 text-sm text-[#555]">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>

              {selectedProd && (
                <div className="bg-[#0e1a22] border border-[#1a3040] rounded-lg px-3.5 py-2.5 mb-3.5 text-sm text-[#6db8e0] flex items-center gap-2">
                  <IconPackage size={16} />
                  Stock actual: <strong className="text-[#8ac0ff]">{selectedProd.stock}</strong> unidades
                </div>
              )}

              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Cantidad a agregar *</label>
                <input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder="Ej: 20" min="1" className="input" />
              </div>
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Precio de compra (nuevo lote) *</label>
                <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="0.00" min="0" step="0.01" className="input" />
              </div>
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Proveedor / Nota</label>
                <input value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} placeholder="Ej: MuscleTech — Factura #001" className="input" />
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={handleActualizar} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all inline-flex items-center gap-1.5">
                  <IconRefresh size={16} /> Actualizar stock
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="section-title">Alertas de stock bajo</h3>
            <div className="card">
              {bajos.length ? bajos.map((p) => (
                <div key={p.id} className="flex justify-between items-center px-3.5 py-2.5 border-b border-[#1e1e1e] last:border-b-0">
                  <div>
                    <div className="text-sm text-[#ccc]">{p.nombre}</div>
                    <div className="text-[11px] text-[#555]">{p.sabor || 'Sin sabor'} — Mínimo: {p.min_stock}</div>
                  </div>
                  <div className="text-xs text-[#e8884e] font-bold">{p.stock} und</div>
                </div>
              )) : (
                <div className="text-center text-[#555] py-5 text-sm">Todo el stock está OK</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="section-title">Historial de actualizaciones de stock</h3>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#141414] text-[#555] text-[11px] uppercase tracking-wide">
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Fecha</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Producto</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Cantidad añadida</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">P. Compra</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length ? historial.map((h) => (
                    <tr key={h.id} className="hover:bg-[#1c1c1c]">
                      <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#666] text-xs">{formatDate(h.fecha)}</td>
                      <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{h.producto_nombre}</td>
                      <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#7ec84e] font-bold">+{h.cantidad} und</td>
                      <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{formatMoney(h.precio)}/und</td>
                      <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#666]">{h.nota || '—'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center text-[#555] py-5">Sin historial</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
