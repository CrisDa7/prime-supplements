import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { formatMoney } from '../lib/utils';

const nivelesActividad = [
  { value: 1.2, label: 'Sedentario', desc: 'Poco o ningún ejercicio' },
  { value: 1.375, label: 'Ligero', desc: 'Ejercicio 1-3 días/semana' },
  { value: 1.55, label: 'Moderado', desc: 'Ejercicio 3-5 días/semana' },
  { value: 1.725, label: 'Activo', desc: 'Ejercicio 6-7 días/semana' },
  { value: 1.9, label: 'Muy activo', desc: 'Ejercicio 2x al día' },
];

function calcularBMR(peso, talla, edad, genero) {
  if (genero === 'masculino') {
    return 10 * peso + 6.25 * talla - 5 * edad + 5;
  }
  return 10 * peso + 6.25 * talla - 5 * edad - 161;
}

function generarPlan(diario, numComidas, alimentos) {
  const proteinas = alimentos.filter((a) => a.categoria === 'proteina');
  const carbos = alimentos.filter((a) => a.categoria === 'carbohidrato');
  const grasas = alimentos.filter((a) => a.categoria === 'grasa');
  const vegetales = alimentos.filter((a) => a.categoria === 'vegetal');

  const porComida = {
    proteinas: diario.proteinas / numComidas,
    carbohidratos: diario.carbohidratos / numComidas,
    grasas: diario.grasas / numComidas,
    calorias: diario.calorias / numComidas,
  };

  const planes = [];
  for (let i = 0; i < numComidas; i++) {
    const pSrc = proteinas[i % proteinas.length];
    const cSrc = carbos[i % carbos.length];
    const gSrc = grasas[i % grasas.length];
    const vSrc = vegetales[i % vegetales.length];

    const gP = Math.round((porComida.proteinas * 0.5) / (pSrc.proteinas / 100));
    const gC = Math.round((porComida.carbohidratos * 0.6) / (cSrc.carbohidratos / 100));
    const gG = Math.round((porComida.grasas * 0.5) / (gSrc.grasas / 100));
    const gV = 100;

    const realP = (gP * pSrc.proteinas / 100).toFixed(1);
    const realC = (gC * cSrc.carbohidratos / 100 + gV * vSrc.carbohidratos / 100).toFixed(1);
    const realG = (gG * gSrc.grasas / 100 + gP * pSrc.grasas / 100).toFixed(1);
    const realCal = (gP * pSrc.calorias / 100 + gC * cSrc.calorias / 100 + gG * gSrc.calorias / 100 + gV * vSrc.calorias / 100).toFixed(0);

    const nombresComidas = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Comida', 'Post-entreno'];
    const items = [
      { nombre: pSrc.nombre, gramos: gP, proteinas: (gP * pSrc.proteinas / 100).toFixed(1), carbohidratos: (gP * pSrc.carbohidratos / 100).toFixed(1), grasas: (gP * pSrc.grasas / 100).toFixed(1), calorias: (gP * pSrc.calorias / 100).toFixed(0) },
      { nombre: cSrc.nombre, gramos: gC, proteinas: (gC * cSrc.proteinas / 100).toFixed(1), carbohidratos: (gC * cSrc.carbohidratos / 100).toFixed(1), grasas: (gC * cSrc.grasas / 100).toFixed(1), calorias: (gC * cSrc.calorias / 100).toFixed(0) },
      { nombre: gSrc.nombre, gramos: gG, proteinas: (gG * gSrc.proteinas / 100).toFixed(1), carbohidratos: (gG * gSrc.carbohidratos / 100).toFixed(1), grasas: (gG * gSrc.grasas / 100).toFixed(1), calorias: (gG * gSrc.calorias / 100).toFixed(0) },
      { nombre: vSrc.nombre, gramos: gV, proteinas: (gV * vSrc.proteinas / 100).toFixed(1), carbohidratos: (gV * vSrc.carbohidratos / 100).toFixed(1), grasas: (gV * vSrc.grasas / 100).toFixed(1), calorias: (gV * vSrc.calorias / 100).toFixed(0) },
    ];

    planes.push({
      nombre: nombresComidas[i] || `Comida ${i + 1}`,
      items,
      totalP: realP,
      totalC: realC,
      totalG: realG,
      totalCal: realCal,
    });
  }

  return { porComida, planes };
}

export default function Dietas() {
  const [form, setForm] = useState({
    nombres: '', apellidos: '', celular: '',
    peso: '', talla: '', edad: '', genero: 'masculino',
    actividad: 1.55, comidas: 4,
  });
  const [alimentos, setAlimentos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/alimentos')
      .then((res) => setAlimentos(res.data))
      .catch(() => showToast('Error al cargar alimentos', 'error'))
      .finally(() => setLoading(false));
  }, []);

  function calcular() {
    const peso = parseFloat(form.peso);
    const talla = parseFloat(form.talla);
    const edad = parseInt(form.edad);
    if (!peso || !talla || !edad) return showToast('Completa peso, talla y edad', 'error');
    if (!form.nombres.trim()) return showToast('Ingresa los nombres', 'error');

    const bmr = Math.round(calcularBMR(peso, talla, edad, form.genero));
    const tdee = Math.round(bmr * parseFloat(form.actividad));
    const proteinas = Math.round(2 * peso);
    const grasas = Math.round(1 * peso);
    const caloriasRestantes = tdee - (proteinas * 4 + grasas * 9);
    const carbohidratos = Math.round(caloriasRestantes / 4);

    const diario = {
      bmr,
      tdee,
      proteinas: Math.max(proteinas, 0),
      grasas: Math.max(grasas, 0),
      carbohidratos: Math.max(carbohidratos, 0),
      calorias: tdee,
    };

    const plan = generarPlan(diario, parseInt(form.comidas), alimentos);

    setResultado({
      persona: {
        nombres: form.nombres,
        apellidos: form.apellidos,
        celular: form.celular,
        peso,
        talla,
        edad,
        genero: form.genero,
      },
      diario,
      ...plan,
    });
  }

  function limpiar() {
    setResultado(null);
    setForm({
      nombres: '', apellidos: '', celular: '',
      peso: '', talla: '', edad: '', genero: 'masculino',
      actividad: 1.55, comidas: 4,
    });
  }

  if (loading) return (
    <>
      <Topbar title="Generador de Dietas" subtitle="Plan personalizado de alimentación" />
      <div className="flex-1 flex items-center justify-center text-[#555] text-sm">Cargando alimentos...</div>
    </>
  );

  const IMC = resultado ? (resultado.persona.peso / Math.pow(resultado.persona.talla / 100, 2)).toFixed(1) : null;

  return (
    <>
      <Topbar title="Generador de Dietas" subtitle="Plan personalizado de alimentación" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <div>
            <h3 className="section-title">Datos de la persona</h3>
            <div className="card p-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Nombres *</label>
                  <input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} placeholder="Ej: Juan" className="input" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Apellidos</label>
                  <input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} placeholder="Ej: Pérez" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Peso (kg) *</label>
                  <input type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} placeholder="70" step="0.1" className="input" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Talla (cm) *</label>
                  <input type="number" value={form.talla} onChange={(e) => setForm({ ...form, talla: e.target.value })} placeholder="170" step="0.1" className="input" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Edad *</label>
                  <input type="number" value={form.edad} onChange={(e) => setForm({ ...form, edad: e.target.value })} placeholder="25" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Género</label>
                  <select value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} className="input">
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Celular</label>
                  <input value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} placeholder="0991234567" className="input" />
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                <label className="text-xs text-[#777] font-medium">Actividad física</label>
                <select value={form.actividad} onChange={(e) => setForm({ ...form, actividad: e.target.value })} className="input">
                  {nivelesActividad.map((n) => (
                    <option key={n.value} value={n.value}>{n.label} — {n.desc}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs text-[#777] font-medium">Comidas al día</label>
                <select value={form.comidas} onChange={(e) => setForm({ ...form, comidas: parseInt(e.target.value) })} className="input">
                  {[3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} comidas</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5">
                <button onClick={calcular} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all">
                  Generar plan
                </button>
                <button onClick={limpiar} className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#888] border border-[#333] hover:bg-[#1a1a1a] transition-all">
                  Limpiar
                </button>
              </div>

              {resultado && (
                <div className="mt-4 bg-[#111] border border-[#222] rounded-lg p-3.5">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-[#555]">IMC</span>
                    <span className="text-sm font-bold text-white">{IMC}</span>
                  </div>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-[#555]">TMB</span>
                    <span className="text-sm font-bold text-[#7ec84e]">{resultado.diario.bmr} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#555]">TDEE (gasto total)</span>
                    <span className="text-sm font-bold text-prime-blue">{resultado.diario.tdee} kcal</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            {resultado ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="section-title mb-0">Plan para {resultado.persona.nombres}</h3>
                  <button onClick={() => window.print()} className="text-xs text-prime-blue hover:underline font-medium">
                    Imprimir PDF
                  </button>
                </div>

                <div className="card p-4 dieta-print">
                  <div className="text-center mb-4 pb-3 border-b border-[#222]">
                    <div className="text-xs text-[#555] uppercase tracking-wide">Macronutrientes diarios</div>
                    <div className="flex justify-center gap-6 mt-2">
                      <div className="text-center">
                        <div className="text-lg font-extrabold text-[#7ec84e]">{resultado.diario.proteinas}g</div>
                        <div className="text-[10px] text-[#555]">Proteínas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-extrabold text-[#e8884e]">{resultado.diario.carbohidratos}g</div>
                        <div className="text-[10px] text-[#555]">Carbohidratos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-extrabold text-prime-blue">{resultado.diario.grasas}g</div>
                        <div className="text-[10px] text-[#555]">Grasas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-extrabold text-white">{resultado.diario.calorias}</div>
                        <div className="text-[10px] text-[#555]">Calorías</div>
                      </div>
                    </div>
                  </div>

                  {resultado.planes.map((comida, idx) => (
                    <div key={idx} className="mb-4 pb-3 border-b border-[#1e1e1e] last:border-b-0 last:mb-0 last:pb-0">
                      <div className="text-xs font-bold text-[#555] uppercase tracking-wide mb-2">{comida.nombre}</div>
                      <div className="text-[11px] text-[#555] mb-2">
                        Meta: {Math.round(resultado.porComida.proteinas)}g P / {Math.round(resultado.porComida.carbohidratos)}g C / {Math.round(resultado.porComida.grasas)}g G / {Math.round(resultado.porComida.calorias)} kcal
                      </div>
                      <div className="space-y-1">
                        {comida.items.map((item, j) => (
                          <div key={j} className="flex items-center justify-between bg-[#0d0d0d] rounded-lg px-3 py-1.5 text-sm">
                            <div className="flex-1 min-w-0">
                              <span className="text-[#ccc]">{item.nombre}</span>
                              <span className="text-[#555] ml-1.5">({item.gramos}g)</span>
                            </div>
                            <div className="text-[11px] text-[#555] ml-3 shrink-0">
                              {item.proteinas}P / {item.carbohidratos}C / {item.grasas}G / {item.calorias}cal
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-right text-[#666] mt-1">
                        Total: {comida.totalP}P / {comida.totalC}C / {comida.totalG}G / {comida.totalCal}cal
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="card p-10 flex flex-col items-center justify-center text-center">
                <div className="text-[#333] text-5xl mb-3">&#127858;</div>
                <h3 className="text-sm font-bold text-[#555] mb-1">Sin plan generado</h3>
                <p className="text-xs text-[#444] max-w-[280px]">Completa los datos de la persona y presiona "Generar plan" para obtener una dieta personalizada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
