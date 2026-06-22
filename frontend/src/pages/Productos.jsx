import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Topbar from '../components/Topbar';
import EditarProductoModal from '../components/EditarProductoModal';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { formatMoney } from '../lib/utils';
import { IconEdit, IconTrash, IconCheck } from '@tabler/icons-react';

export default function Productos() {
  const [tab, setTab] = useState('list');
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', sabor: '', compra: '', venta: '', cantidad: '', minStock: 5 });
  const { showToast } = useToast();

  useEffect(() => { loadProductos(); }, []);

  async function loadProductos() {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch { showToast('Error al cargar productos', 'error'); }
  }

  const filtered = productos.filter((p) =>
    !search || p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.sabor || '').toLowerCase().includes(search.toLowerCase())
  );

  function calcularPreview() {
    const c = parseFloat(form.compra) || 0;
    const v = parseFloat(form.venta) || 0;
    if (c > 0 && v > 0) {
      const gan = v - c;
      const pct = ((gan / c) * 100).toFixed(1);
      return { gan, pct };
    }
    return null;
  }

  async function handleSave() {
    if (!form.nombre.trim()) return showToast('Ingresa el nombre del producto', 'error');
    const compra = parseFloat(form.compra);
    const venta = parseFloat(form.venta);
    const cantidad = parseInt(form.cantidad);
    if (isNaN(compra) || compra < 0) return showToast('Precio de compra inválido', 'error');
    if (isNaN(venta) || venta < 0) return showToast('Precio de venta inválido', 'error');
    if (isNaN(cantidad) || cantidad < 0) return showToast('Cantidad inválida', 'error');

    try {
      await api.post('/productos', {
        nombre: form.nombre, sabor: form.sabor, compra, venta, stock: cantidad, minStock: parseInt(form.minStock) || 5,
      });
      showToast('Producto registrado exitosamente');
      setForm({ nombre: '', sabor: '', compra: '', venta: '', cantidad: '', minStock: 5 });
      setTab('list');
      loadProductos();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al guardar', 'error');
    }
  }

  async function handleDelete(id) {
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar producto',
      html: `¿Seguro que deseas eliminar <strong>${prod.nombre}</strong>?<br/>Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e05454',
      cancelButtonColor: '#333',
      background: '#171717',
      color: '#d4d4d4',
      iconColor: '#e05454',
      customClass: {
        popup: 'rounded-xl border border-[#222] shadow-2xl',
        title: 'text-base font-bold',
        htmlContainer: 'text-sm text-[#888]',
        confirmButton: 'px-5 py-2 rounded-lg text-sm font-bold',
        cancelButton: 'px-5 py-2 rounded-lg text-sm font-bold',
      },
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/productos/${id}`);
      showToast('Producto eliminado');
      loadProductos();
    } catch { showToast('Error al eliminar', 'error'); }
  }

  const preview = calcularPreview();

  return (
    <>
      <Topbar title="Productos" subtitle="Gestiona tu catálogo de suplementos" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="flex gap-1.5">
          <button
            onClick={() => setTab('list')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'list' ? 'bg-prime-blue text-white' : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#777] hover:text-[#bbb] hover:bg-[#222]'
            }`}
          >
            Lista de productos
          </button>
          <button
            onClick={() => { setTab('new'); setForm({ nombre: '', sabor: '', compra: '', venta: '', cantidad: '', minStock: 5 }); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'new' ? 'bg-prime-blue text-white' : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#777] hover:text-[#bbb] hover:bg-[#222]'
            }`}
          >
            + Nuevo producto
          </button>
        </div>

        {tab === 'list' && (
          <div className="card mt-4">
            <div className="p-3.5 pb-0">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="bg-[#111] border border-[#2a2a2a] text-[#ccc] px-3.5 py-2 rounded-lg text-sm outline-none w-[280px] focus:border-prime-blue"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#141414] text-[#555] text-[11px] uppercase tracking-wide">
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Nombre</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Sabor</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">P. Compra</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">P. Venta</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Stock</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Ganancia</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Estado</th>
                    <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length ? filtered.map((p) => {
                    const gan = p.venta - p.compra;
                    const margen = p.compra > 0 ? ((gan / p.compra) * 100).toFixed(0) : 0;
                    const bajo = p.stock <= p.min_stock;
                    return (
                      <tr key={p.id} className="hover:bg-[#1c1c1c]">
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]"><strong className="text-[#ddd]">{p.nombre}</strong></td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                          {p.sabor ? <span className="bg-[#1e2d1e] text-[#7ec84e] text-[11px] px-2 py-0.5 rounded-full">{p.sabor}</span> : <span className="text-[#444]">—</span>}
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{formatMoney(p.compra)}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-prime-blue font-bold">{formatMoney(p.venta)}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                          <strong className={bajo ? 'text-[#e8884e]' : 'text-[#ccc]'}>{p.stock}</strong> und
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                          <span className="text-[#7ec84e]">{formatMoney(gan)}</span>{' '}
                          <span className="text-[#555] text-[11px]">({margen}%)</span>
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                          {bajo ? <span className="badge-low">Bajo</span> : <span className="badge-ok">OK</span>}
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                          <button onClick={() => setEditing(p)} className="text-[#888] hover:text-[#bbb] p-1.5 rounded-lg hover:bg-[#1a1a1a] transition-all" title="Editar">
                            <IconEdit size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-[#e05454] hover:text-[#ff6b4a] p-1.5 rounded-lg hover:bg-[#1e1010] transition-all ml-1" title="Eliminar">
                            <IconTrash size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={8} className="text-center text-[#555] py-6">No se encontraron productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'new' && (
          <div className="card form-card mt-4 p-5">
            <h3 className="text-[15px] font-bold text-[#ddd] mb-4">Registrar nuevo producto</h3>
            <div className="grid grid-cols-2 gap-3.5 mb-3.5 max-md:grid-cols-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#777] font-medium">Nombre del producto *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Whey Protein Gold 5lb" className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#777] font-medium">Sabor (opcional)</label>
                <input value={form.sabor} onChange={(e) => setForm({ ...form, sabor: e.target.value })} placeholder="Ej: Chocolate, Vainilla..." className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#777] font-medium">Precio de compra ($) *</label>
                <input type="number" value={form.compra} onChange={(e) => setForm({ ...form, compra: e.target.value })} placeholder="0.00" min="0" step="0.01" className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#777] font-medium">Precio de venta ($) *</label>
                <input type="number" value={form.venta} onChange={(e) => setForm({ ...form, venta: e.target.value })} placeholder="0.00" min="0" step="0.01" className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#777] font-medium">Cantidad inicial (stock) *</label>
                <input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder="0" min="0" className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#777] font-medium">Stock mínimo alerta</label>
                <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="5" min="0" className="input" />
              </div>
            </div>
            {preview && (
              <div className="bg-[#1a2233] border border-[#1e3a5f] rounded-lg px-4 py-3 flex items-center gap-2.5 mb-3.5 text-sm text-[#888]">
                <span>Ganancia por unidad:</span>
                <strong className="text-[18px]" style={{ color: preview.gan >= 0 ? '#3b82f6' : '#e05454' }}>
                  {formatMoney(preview.gan)}
                </strong>
                <span className="text-[#aaa]">({preview.pct}% de margen)</span>
              </div>
            )}
            <div className="flex gap-2.5 justify-end mt-4">
              <button onClick={() => setTab('list')} className="px-4 py-2 rounded-lg text-sm font-bold text-[#888] bg-transparent border border-[#333] hover:bg-[#1a1a1a] hover:text-[#bbb] transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all inline-flex items-center gap-1.5">
                <IconCheck size={16} /> Guardar producto
              </button>
            </div>
          </div>
        )}

        {editing && (
          <EditarProductoModal
            producto={editing}
            onClose={() => setEditing(null)}
            onSaved={() => loadProductos()}
          />
        )}
      </div>
    </>
  );
}
