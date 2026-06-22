import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import ComprobanteModal from '../components/ComprobanteModal';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { formatMoney, formatDate } from '../lib/utils';
import { IconCheck, IconShoppingCart, IconTrash, IconPlus, IconPrinter } from '@tabler/icons-react';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [form, setForm] = useState({ cliente: '', telefono: '', descripcion: '' });
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProd, setSelectedProd] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [precioPersonalizado, setPrecioPersonalizado] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get('/productos'), api.get('/ventas')]).then(([pRes, vRes]) => {
      setProductos(pRes.data.filter((p) => p.stock > 0));
      setVentas(vRes.data);
    }).catch(() => showToast('Error al cargar datos', 'error'));
  }, []);

  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sabor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const precioUnitario = parseFloat(precioPersonalizado) || (selectedProd ? selectedProd.venta : 0);
  const subtotalItem = precioUnitario * (parseInt(cantidad) || 0);
  const totalCarrito = cart.reduce((sum, item) => sum + item.subtotal, 0) + subtotalItem;

  function agregarAlCarrito() {
    if (!selectedProd) return showToast('Selecciona un producto', 'error');
    const cant = parseInt(cantidad);
    if (!cant || cant < 1) return showToast('Cantidad inválida', 'error');
    if (selectedProd.stock < cant) return showToast(`Stock insuficiente. Disponible: ${selectedProd.stock} und`, 'error');

    const existente = cart.findIndex((i) => i.productoId === selectedProd.id && i.precioUnitario === precioUnitario);
    if (existente >= 0) {
      const nuevaCant = cart[existente].cantidad + cant;
      if (selectedProd.stock < nuevaCant) return showToast(`Stock insuficiente. Disponible: ${selectedProd.stock} und`, 'error');
      const updated = [...cart];
      updated[existente] = { ...updated[existente], cantidad: nuevaCant, subtotal: nuevaCant * precioUnitario };
      setCart(updated);
    } else {
      setCart([...cart, {
        productoId: selectedProd.id,
        nombre: selectedProd.nombre,
        sabor: selectedProd.sabor,
        cantidad: cant,
        precioUnitario,
        subtotal: cant * precioUnitario,
        stock: selectedProd.stock,
      }]);
    }

    setSearchTerm('');
    setSelectedProd(null);
    setCantidad('1');
    setPrecioPersonalizado('');
    showToast(`${selectedProd.nombre} agregado al carrito`);
  }

  function eliminarDelCarrito(index) {
    setCart(cart.filter((_, i) => i !== index));
  }

  function limpiarCarrito() {
    setCart([]);
  }

  function handleProductoSeleccionado(p) {
    setSelectedProd(p);
    setSearchTerm(`${p.nombre}${p.sabor ? ` (${p.sabor})` : ''}`);
    setCantidad('1');
    setPrecioPersonalizado(p.venta.toString());
  }

  async function handleRegistrar() {
    if (!form.cliente.trim()) return showToast('Ingresa el nombre del cliente', 'error');
    if (cart.length === 0) return showToast('Agrega al menos un producto al carrito', 'error');

    const items = cart.map((i) => ({
      productoId: i.productoId,
      cantidad: i.cantidad,
      precioVenta: i.precioUnitario,
    }));

    try {
      const res = await api.post('/ventas', {
        cliente: form.cliente,
        telefono: form.telefono,
        descripcion: form.descripcion,
        items,
      });
      showToast(`Venta registrada. Total: ${formatMoney(res.data.total)}`);
      setForm({ cliente: '', telefono: '', descripcion: '' });
      setCart([]);

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
      <Topbar title="Nueva Venta" subtitle="Registra ventas con múltiples productos" />
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
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Descripción / Nota</label>
                <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Regalo, descuento especial, etc." className="input" />
              </div>

              <div className="border-t border-[#222] pt-4 mb-4">
                <h4 className="text-xs font-bold text-[#555] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <IconShoppingCart size={14} /> Agregar productos
                </h4>

                <div className="flex flex-col gap-1 mb-3 relative">
                  <label className="text-xs text-[#777] font-medium">Buscar producto</label>
                  <input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (selectedProd && e.target.value !== `${selectedProd.nombre}${selectedProd.sabor ? ` (${selectedProd.sabor})` : ''}`) {
                        setSelectedProd(null);
                      }
                    }}
                    placeholder="Escribe para buscar..."
                    className="input"
                  />
                  {searchTerm.length >= 2 && !selectedProd && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg max-h-48 overflow-y-auto z-10 shadow-xl">
                      {filteredProductos.length ? filteredProductos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleProductoSeleccionado(p)}
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
                  <div className="bg-[#111] border border-[#222] rounded-lg p-3.5 mb-3">
                    <div className="text-sm text-[#ccc] font-medium mb-2.5">
                      {selectedProd.nombre}{selectedProd.sabor ? ` (${selectedProd.sabor})` : ''}
                      <span className="text-[#555] text-xs ml-2 font-normal">Stock: {selectedProd.stock}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] text-[#555] font-medium">Cantidad</label>
                        <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" className="input text-sm py-1.5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] text-[#555] font-medium">Precio unit.</label>
                        <input type="number" value={precioPersonalizado} onChange={(e) => setPrecioPersonalizado(e.target.value)} step="0.01" min="0" className="input text-sm py-1.5" />
                      </div>
                      <div className="flex flex-col gap-0.5 justify-end">
                        <label className="text-[10px] text-[#555] font-medium">Subtotal</label>
                        <div className="text-prime-blue font-bold text-sm py-1.5">{formatMoney(subtotalItem)}</div>
                      </div>
                    </div>
                    <button onClick={agregarAlCarrito} className="w-full py-1.5 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all inline-flex items-center justify-center gap-1">
                      <IconPlus size={15} /> Agregar al carrito
                    </button>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-[#222] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-[#555] uppercase tracking-wider">Carrito ({cart.length} items)</h4>
                    <button onClick={limpiarCarrito} className="text-[#e05454] text-xs hover:underline">Limpiar</button>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {cart.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#111] border border-[#222] rounded-lg px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#ccc] truncate">{item.nombre}{item.sabor ? ` (${item.sabor})` : ''}</div>
                          <div className="text-[11px] text-[#555]">
                            {item.cantidad} x {formatMoney(item.precioUnitario)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-sm font-bold text-prime-blue">{formatMoney(item.subtotal)}</span>
                          <button onClick={() => eliminarDelCarrito(i)} className="text-[#555] hover:text-[#e05454] transition-colors">
                            <IconTrash size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.descripcion && (
                    <div className="text-xs text-[#666] mb-2 italic">Nota: {form.descripcion}</div>
                  )}
                  <div className="flex justify-between items-center pt-2.5 border-t border-[#222]">
                    <span className="text-sm text-[#888]">Total carrito</span>
                    <strong className="text-[22px] text-prime-blue">{formatMoney(totalCarrito)}</strong>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={handleRegistrar} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1d6d35] border border-[#2a8445] hover:bg-[#226040] transition-all inline-flex items-center gap-1.5">
                      <IconCheck size={16} /> Registrar venta ({formatMoney(totalCarrito)})
                    </button>
                  </div>
                </div>
              )}

              {cart.length === 0 && !selectedProd && (
                <div className="text-center text-[#555] text-sm py-6 border-t border-[#222]">
                  Busca y agrega productos al carrito para continuar
                </div>
              )}
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
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Productos</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Total</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Fecha</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.length ? ventas.map((v) => {
                      const items = v.items || [{ producto_nombre: v.producto_nombre, cantidad: v.cantidad }];
                      return (
                        <tr key={v.id} className="hover:bg-[#1c1c1c]">
                          <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{v.cliente}</td>
                          <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#666] text-xs">{v.telefono || '—'}</td>
                          <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc] text-xs">
                            {Array.isArray(items) ? items.map((it, idx) => (
                              <span key={idx}>{it.producto_nombre}{it.sabor ? ` (${it.sabor})` : ''} x{it.cantidad}{idx < items.length - 1 ? ', ' : ''}</span>
                            )) : `${v.producto_nombre} x${v.cantidad}`}
                          </td>
                          <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#7ec84e] font-bold">{formatMoney(v.total)}</td>
                          <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#555] text-xs">{formatDate(v.fecha)}</td>
                          <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                            <button onClick={() => setComprobante(v)} className="text-[#888] hover:text-[#bbb] p-1.5 rounded-lg hover:bg-[#1a1a1a]" title="Ver comprobante">
                              <IconPrinter size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={6} className="text-center text-[#555] py-5">Sin ventas registradas</td></tr>
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
