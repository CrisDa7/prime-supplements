import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { IconTrash } from '@tabler/icons-react';
import { formatDate } from '../lib/utils';

const clasificaciones = [
  { min: 0, max: 18.5, label: 'Bajo peso', color: '#e8884e', desc: 'Delgadez severa, moderada o leve' },
  { min: 18.5, max: 25, label: 'Normal', color: '#7ec84e', desc: 'Peso saludable' },
  { min: 25, max: 30, label: 'Sobrepeso', color: '#e8884e', desc: 'Pre-obesidad (grado I)' },
  { min: 30, max: 35, label: 'Obesidad grado I', color: '#e05454', desc: 'Obesidad moderada' },
  { min: 35, max: 40, label: 'Obesidad grado II', color: '#e03030', desc: 'Obesidad severa' },
  { min: 40, max: Infinity, label: 'Obesidad grado III', color: '#c01010', desc: 'Obesidad mórbida' },
];

function calcularClasificacion(imc) {
  return clasificaciones.find((c) => imc >= c.min && imc < c.max) || clasificaciones[0];
}

export default function IMC() {
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('imc_historial');
    if (stored) setHistorial(JSON.parse(stored));
  }, []);

  function guardarHistorial(nuevo) {
    const updated = [nuevo, ...historial].slice(0, 50);
    setHistorial(updated);
    localStorage.setItem('imc_historial', JSON.stringify(updated));
  }

  function calcular() {
    const pesoNum = parseFloat(peso);
    const tallaNum = parseFloat(talla);
    if (!pesoNum || pesoNum <= 0) return;
    if (!tallaNum || tallaNum <= 0) return;

    const tallaM = tallaNum / 100;
    const imc = pesoNum / (tallaM * tallaM);
    const redondeado = Math.round(imc * 100) / 100;
    const clasificacion = calcularClasificacion(redondeado);

    const entry = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      peso: pesoNum,
      talla: tallaNum,
      imc: redondeado,
      label: clasificacion.label,
      color: clasificacion.color,
    };

    setResultado(entry);
    guardarHistorial(entry);
  }

  function limpiarHistorial() {
    setHistorial([]);
    localStorage.removeItem('imc_historial');
  }

  function eliminarRegistro(id) {
    const updated = historial.filter((h) => h.id !== id);
    setHistorial(updated);
    localStorage.setItem('imc_historial', JSON.stringify(updated));
  }

  return (
    <>
      <Topbar title="Calculadora IMC" subtitle="Índice de Masa Corporal — Clasificación OMS" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <div>
            <h3 className="section-title">Calcular IMC</h3>
            <div className="card p-5">
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Peso (kg) *</label>
                <input
                  type="number"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej: 70"
                  min="1"
                  step="0.1"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-1 mb-3.5">
                <label className="text-xs text-[#777] font-medium">Talla (cm) *</label>
                <input
                  type="number"
                  value={talla}
                  onChange={(e) => setTalla(e.target.value)}
                  placeholder="Ej: 170"
                  min="1"
                  step="0.1"
                  className="input"
                />
              </div>
              <button
                onClick={calcular}
                disabled={!peso || !talla}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all disabled:opacity-50"
              >
                Calcular IMC
              </button>

              {resultado && (
                <div className="mt-4 bg-[#111] border border-[#222] rounded-lg p-4 text-center">
                  <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Tu IMC</div>
                  <div className="text-4xl font-extrabold text-white mb-1">{resultado.imc}</div>
                  <div
                    className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white mt-1"
                    style={{ backgroundColor: resultado.color }}
                  >
                    {resultado.label}
                  </div>
                  <div className="text-[11px] text-[#555] mt-2">
                    {resultado.peso} kg / {resultado.talla} cm
                  </div>
                </div>
              )}

              <div className="mt-5 border-t border-[#222] pt-4">
                <h4 className="text-xs font-bold text-[#555] uppercase tracking-wider mb-3">Clasificación OMS</h4>
                <div className="space-y-1.5">
                  {clasificaciones.map((c) => (
                    <div key={c.label} className="flex items-center justify-between text-sm bg-[#0d0d0d] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-[#ccc]">{c.label}</span>
                      </div>
                      <span className="text-[#555] text-xs">
                        {c.min === 0 ? `< ${c.max}` : c.max === Infinity ? `${c.min}+` : `${c.min} - ${c.max < 25 ? c.max : c.max - 0.1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title mb-0">Historial</h3>
              {historial.length > 0 && (
                <button onClick={limpiarHistorial} className="text-xs text-[#e05454] hover:underline">
                  Limpiar todo
                </button>
              )}
            </div>
            <div className="card">
              {historial.length ? (
                <div className="divide-y divide-[#1e1e1e]">
                  {historial.map((h) => (
                    <div key={h.id} className="px-4 py-3 flex items-center justify-between hover:bg-[#1c1c1c]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{h.imc}</span>
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: h.color }}
                          >
                            {h.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#555] mt-0.5">
                          {h.peso} kg / {h.talla} cm &middot; {formatDate(h.fecha)}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarRegistro(h.id)}
                        className="text-[#444] hover:text-[#e05454] transition-colors ml-2"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[#555] py-5 text-sm">
                  No hay registros aún. Calcula tu IMC para ver el historial.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
