import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import ComprobanteModal from '../components/ComprobanteModal';
import api from '../api/client';
import { formatMoney, formatDate } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({ ingresos: 0, egresos: 0, neta: 0, margen: 0, productos: 0, stockBajo: 0 });
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [comprobante, setComprobante] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [movRes, prodRes, ventasRes] = await Promise.all([
          api.get('/movimientos'),
          api.get('/productos'),
          api.get('/ventas'),
        ]);
        const movs = movRes.data;
        const prods = prodRes.data;
        const vts = ventasRes.data;

        const ingresos = movs.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + parseFloat(m.monto), 0);
        const egresos = movs.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + parseFloat(m.monto), 0);
        const neta = ingresos - egresos;
        const margen = ingresos > 0 ? ((neta / ingresos) * 100).toFixed(1) : 0;

        setStats({ ingresos, egresos, neta, margen, productos: prods.length, stockBajo: prods.filter((p) => p.stock <= p.min_stock).length });
        setVentas(vts.slice(0, 6));
        setProductos(prods);
      } catch {}
    }
    load();
  }, []);

  const lowStock = productos.filter((p) => p.stock <= p.min_stock);

  return (
    <>
      <Topbar title="Dashboard" subtitle="Resumen general de tu negocio" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          <StatCard label="Ingresos totales" value={formatMoney(stats.ingresos)} sub="Todas las ventas" />
          <StatCard label="Egresos (compras)" value={formatMoney(stats.egresos)} sub="Capital invertido" valueColor="#8ac0ff" />
          <StatCard label="Ganancia neta" value={formatMoney(stats.neta)} sub={`Margen ${stats.margen}%`} />
          <StatCard label="Productos activos" value={stats.productos} sub={`${stats.stockBajo} con stock bajo`} />
        </div>

        <div className="grid grid-cols-2 gap-5 mt-6 max-md:grid-cols-1">
          <div>
            <h3 className="section-title">Últimas ventas</h3>
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#141414] text-[#555] text-[11px] uppercase tracking-wide">
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Cliente</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Producto</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Cant.</th>
                      <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.length ? ventas.map((v) => (
                      <tr key={v.id} className="hover:bg-[#1c1c1c]">
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{v.cliente}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{v.producto_nombre}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{v.cantidad}</td>
                        <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#7ec84e] font-bold">{formatMoney(v.total)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-center text-[#555] py-5">Sin ventas registradas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
            <h3 className="section-title">Stock bajo</h3>
            <div className="card">
              {lowStock.length ? lowStock.map((p) => (
                <div key={p.id} className="flex justify-between items-center px-3.5 py-2.5 border-b border-[#1e1e1e] last:border-b-0">
                  <div>
                    <div className="text-sm text-[#ccc]">{p.nombre}</div>
                    <div className="text-[11px] text-[#555]">{p.sabor || 'Sin sabor'}</div>
                  </div>
                  <div className="text-xs text-[#e8884e] font-bold">{p.stock} und</div>
                </div>
              )) : (
                <div className="text-center text-[#555] py-5 text-sm">Todo el stock está OK</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {comprobante && <ComprobanteModal venta={comprobante} onClose={() => setComprobante(null)} />}
    </>
  );
}
