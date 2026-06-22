import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ComprobanteModal from '../components/ComprobanteModal';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { formatMoney, formatDate } from '../lib/utils';
import { IconCheck, IconPrinter } from '@tabler/icons-react';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [form, setForm] = useState({ cliente: '', telefono: '', productoId: '', cantidad: '1', precioUnitario: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get('/productos'), api.get('/ventas')]).then(([pRes, vRes]) => {
      setProductos(pRes.data.filter((p) => p.stock > 0));
      setVentas(vRes.data);
    }).catch(() => showToast('Error al cargar datos', 'error'));
  }, []);

  const selectedProd = productos.find((p) => p.id === parseInt(form.productoId));
  const precio = parseFloat(form.precioUnitario) || (selectedProd ? selectedProd.venta : 0);
  const cantidadNum = parseInt(form.cantidad) || 0;
  const total = precio * cantidadNum;
  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sabor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleRegistrar() {
    if (!form.cliente.trim()) return showToast('Ingresa el nombre del cliente', 'error');
    if (!form.productoId) return showToast('Selecciona un producto', 'error');
    if (!cantidadNum || cantidadNum < 1) return showToast('Cantidad inválida', 'error');
    if (selectedProd && selectedProd.stock < cantidadNum) {
      return showToast(`Stock insuficiente. Disponible: ${selectedProd.stock} und`, 'error');
    }

    try {
      const res = await api.post('/ventas', {
        cliente: form.cliente, telefono: form.telefono, productoId: parseInt(form.productoId), cantidad: cantidadNum, precioVenta: precio,
      });
      showToast(`Venta registrada. Total: ${formatMoney(res.data.total)}`);
      setSearchTerm('');
      setForm({ cliente: '', telefono: '', productoId: '', cantidad: '1', precioUnitario: '' });

      const [pRes, vRes] = await Promise.all([api.get('/productos'), api.get('/ventas')]);
      setProductos(pRes.data.filter((p) => p.stock > 0));
      setVentas(vRes.data);

      setTimeout(() => setComprobante(res.data), 300);
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al registrar venta', 'error');
    }
  }

  return (
    <>
      <Topbar title="Nueva Venta" subtitle="Registra ventas y genera comprobantes" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <div>
            <h3 className="section-title">Registrar venta</h3>
            <div className="card p-5">
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Nombre del cliente *</label>
                <input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Ej: Carlos Mendoza" className="input" />
              </div>
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Teléfono del cliente</label>
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 0991234567" className="input" />
              </div>
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
                          setForm({ ...form, productoId: p.id.toString(), precioUnitario: p.venta.toString() });
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
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Cantidad *</label>
                <input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder="1" min="1" className="input" />
              </div>

              {selectedProd && (
                <div className="bg-[#111] border border-[#222] rounded-lg p-3.5 my-3.5">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#777] font-medium">Precio unitario</label>
                      <input type="number" value={form.precioUnitario} onChange={(e) => setForm({ ...form, precioUnitario: e.target.value })} step="0.01" min="0" className="input" />
                    </div>
                  </div>
                  <div className="flex justify-between pt-2.5 mt-1.5 border-t border-[#222] text-[15px]"><span>Total:</span><strong className="text-prime-blue text-xl">{formatMoney(total)}</strong></div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button onClick={handleRegistrar} className="px-4 py-2 rounded-lg text-sm font-bold text-[#7ddb99] bg-[#1d6d35] border border-[#2a8445] hover:bg-[#226040] transition-all inline-flex items-center gap-1.5">
                  <IconCheck size={16} /> Registrar venta
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="section-title">Ventas recientes</h3>
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#141414] text-[#555] text-[11px] uppercase tracking-wide">
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Cliente</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Tel.</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Producto</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Cant.</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Total</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Fecha</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.length ? ventas.map((v) => (
                      <tr key={v.id} className="hover:bg-[#1c1c1c]">
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{v.cliente}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#666] text-xs">{v.telefono || '—'}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{v.producto_nombre}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{v.cantidad}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#7ec84e] font-bold">{formatMoney(v.total)}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#555] text-xs">{formatDate(v.fecha)}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                          <button onClick={() => setComprobante(v)} className="text-[#888] hover:text-[#bbb] p-1.5 rounded-lg hover:bg-[#1a1a1a]" title="Ver comprobante">
                            <IconPrinter size={15} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="text-center text-[#555] py-5">Sin ventas registradas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {comprobante && <ComprobanteModal venta={comprobante} onClose={() => setComprobante(null)} />}
    </>
  );
}
