import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import api from '../api/client';
import { formatMoney, formatDate } from '../lib/utils';

export default function Ganancias() {
  const [movimientos, setMovimientos] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => { load(); }, [filtro]);

  async function load() {
    try {
      const params = filtro ? { tipo: filtro } : {};
      const res = await api.get('/movimientos', { params });
      setMovimientos(res.data);
    } catch {}
  }

  const ingresos = movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + parseFloat(m.monto), 0);
  const egresos = movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + parseFloat(m.monto), 0);
  const neta = ingresos - egresos;
  const margen = ingresos > 0 ? ((neta / ingresos) * 100).toFixed(1) : 0;

  const cronologico = [...movimientos].reverse().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  let saldo = 0;
  const saldos = {};
  cronologico.forEach((m) => {
    saldo += m.tipo === 'ingreso' ? parseFloat(m.monto) : -parseFloat(m.monto);
    saldos[m.id] = saldo;
  });

  const displayed = [...movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <>
      <Topbar title="Ganancias & Reportes" subtitle="Ingresos, egresos y utilidad neta" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          <StatCard label="Total ingresos" value={formatMoney(ingresos)} sub="Ventas acumuladas" />
          <StatCard label="Total egresos" value={formatMoney(egresos)} sub="Compras de stock" valueColor="#8ac0ff" />
          <StatCard
            label="Ganancia neta"
            value={formatMoney(neta)}
            sub={neta >= 0 ? '↑ Positivo' : '↓ Negativo'}
            valueColor={neta >= 0 ? '#3b82f6' : '#e05454'}
          />
          <StatCard label="Margen global" value={`${margen}%`} sub="De rentabilidad" />
        </div>

        <div className="flex items-center gap-3 mt-6 flex-wrap">
          <h3 className="section-title mb-0">Todos los movimientos</h3>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] px-3 py-1.5 rounded-lg text-xs outline-none">
            <option value="">Todos</option>
            <option value="ingreso">Solo ingresos</option>
            <option value="egreso">Solo egresos</option>
          </select>
        </div>

        <div className="card mt-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#141414] text-[#555] text-[11px] uppercase tracking-wide">
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Fecha</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Tipo</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Descripción</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Monto</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Saldo acum.</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length ? displayed.map((m) => (
                  <tr key={m.id} className="hover:bg-[#1c1c1c]">
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#666] text-xs">{formatDate(m.fecha)}</td>
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                      <span className={m.tipo === 'ingreso' ? 'badge-ingreso' : 'badge-egreso'}>
                        {m.tipo === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{m.descripcion}</td>
                    <td className={`px-3.5 py-2.5 border-b border-[#1e1e1e] font-bold ${m.tipo === 'ingreso' ? 'text-[#7ec84e]' : 'text-[#e05454]'}`}>
                      {m.tipo === 'ingreso' ? '+' : '-'}{formatMoney(m.monto)}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#888]">{formatMoney(saldos[m.id] || 0)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center text-[#555] py-5">Sin movimientos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
