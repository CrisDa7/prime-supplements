import { useState } from 'react';
import Topbar from '../components/Topbar';

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

  function calcular() {
    const pesoNum = parseFloat(peso);
    const tallaNum = parseFloat(talla);
    if (!pesoNum || pesoNum <= 0) return;
    if (!tallaNum || tallaNum <= 0) return;

    const tallaM = tallaNum / 100;
    const imc = pesoNum / (tallaM * tallaM);
    const redondeado = Math.round(imc * 100) / 100;
    const clasificacion = calcularClasificacion(redondeado);

    setResultado({ imc: redondeado, label: clasificacion.label, color: clasificacion.color });
  }

  function limpiar() {
    setPeso('');
    setTalla('');
    setResultado(null);
  }

  return (
    <>
      <Topbar title="Calculadora IMC" subtitle="Índice de Masa Corporal — Clasificación OMS" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="max-w-[500px]">
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
            <div className="flex gap-2.5">
              <button
                onClick={calcular}
                disabled={!peso || !talla}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all disabled:opacity-50"
              >
                Calcular IMC
              </button>
              <button onClick={limpiar} className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#888] border border-[#333] hover:bg-[#1a1a1a] transition-all">
                Limpiar
              </button>
            </div>

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
      </div>
    </>
  );
}
