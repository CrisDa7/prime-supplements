import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

const ALIMENTOS_FALLBACK = [
  { id: 1, nombre: 'Pechuga de pollo', categoria: 'proteina', proteinas: 31, carbohidratos: 0, grasas: 3.6, calorias: 165 },
  { id: 2, nombre: 'Huevo entero', categoria: 'proteina', proteinas: 13, carbohidratos: 1.1, grasas: 11, calorias: 155 },
  { id: 3, nombre: 'Clara de huevo', categoria: 'proteina', proteinas: 11, carbohidratos: 0.7, grasas: 0, calorias: 48 },
  { id: 4, nombre: 'Atún en agua', categoria: 'proteina', proteinas: 26, carbohidratos: 0, grasas: 1, calorias: 116 },
  { id: 5, nombre: 'Carne de res magra', categoria: 'proteina', proteinas: 26, carbohidratos: 0, grasas: 15, calorias: 250 },
  { id: 6, nombre: 'Pescado blanco', categoria: 'proteina', proteinas: 20, carbohidratos: 0, grasas: 1, calorias: 90 },
  { id: 7, nombre: 'Salmón', categoria: 'proteina', proteinas: 20, carbohidratos: 0, grasas: 13, calorias: 208 },
  { id: 8, nombre: 'Lomo de cerdo', categoria: 'proteina', proteinas: 27, carbohidratos: 0, grasas: 14, calorias: 242 },
  { id: 9, nombre: 'Queso fresco', categoria: 'proteina', proteinas: 18, carbohidratos: 1.3, grasas: 20, calorias: 260 },
  { id: 10, nombre: 'Yogur griego', categoria: 'proteina', proteinas: 10, carbohidratos: 3.6, grasas: 0.7, calorias: 63 },
  { id: 11, nombre: 'Arroz blanco', categoria: 'carbohidrato', proteinas: 2.7, carbohidratos: 28, grasas: 0.3, calorias: 130 },
  { id: 12, nombre: 'Arroz integral', categoria: 'carbohidrato', proteinas: 2.5, carbohidratos: 23, grasas: 0.9, calorias: 111 },
  { id: 13, nombre: 'Avena en hojuelas', categoria: 'carbohidrato', proteinas: 13.5, carbohidratos: 66, grasas: 6.5, calorias: 379 },
  { id: 14, nombre: 'Papa', categoria: 'carbohidrato', proteinas: 2, carbohidratos: 17, grasas: 0.1, calorias: 77 },
  { id: 15, nombre: 'Camote', categoria: 'carbohidrato', proteinas: 1.6, carbohidratos: 20, grasas: 0.05, calorias: 86 },
  { id: 16, nombre: 'Pan integral', categoria: 'carbohidrato', proteinas: 9, carbohidratos: 49, grasas: 3.4, calorias: 265 },
  { id: 17, nombre: 'Pasta de trigo', categoria: 'carbohidrato', proteinas: 5, carbohidratos: 25, grasas: 0.5, calorias: 126 },
  { id: 18, nombre: 'Quinoa', categoria: 'carbohidrato', proteinas: 4.4, carbohidratos: 21, grasas: 1.9, calorias: 120 },
  { id: 19, nombre: 'Plátano', categoria: 'carbohidrato', proteinas: 1.1, carbohidratos: 23, grasas: 0.3, calorias: 89 },
  { id: 20, nombre: 'Lentejas cocidas', categoria: 'carbohidrato', proteinas: 9, carbohidratos: 20, grasas: 0.4, calorias: 116 },
  { id: 21, nombre: 'Aceite de oliva', categoria: 'grasa', proteinas: 0, carbohidratos: 0, grasas: 100, calorias: 884 },
  { id: 22, nombre: 'Aguacate', categoria: 'grasa', proteinas: 2, carbohidratos: 9, grasas: 15, calorias: 160 },
  { id: 23, nombre: 'Almendras', categoria: 'grasa', proteinas: 21, carbohidratos: 22, grasas: 50, calorias: 578 },
  { id: 24, nombre: 'Maní', categoria: 'grasa', proteinas: 26, carbohidratos: 16, grasas: 49, calorias: 567 },
  { id: 25, nombre: 'Semillas de chía', categoria: 'grasa', proteinas: 17, carbohidratos: 42, grasas: 31, calorias: 486 },
  { id: 26, nombre: 'Mantequilla de maní', categoria: 'grasa', proteinas: 25, carbohidratos: 20, grasas: 50, calorias: 588 },
  { id: 27, nombre: 'Brócoli', categoria: 'vegetal', proteinas: 2.8, carbohidratos: 7, grasas: 0.4, calorias: 35 },
  { id: 28, nombre: 'Espinaca', categoria: 'vegetal', proteinas: 2.9, carbohidratos: 3.6, grasas: 0.4, calorias: 23 },
  { id: 29, nombre: 'Zanahoria', categoria: 'vegetal', proteinas: 0.9, carbohidratos: 10, grasas: 0.2, calorias: 41 },
  { id: 30, nombre: 'Tomate', categoria: 'vegetal', proteinas: 0.9, carbohidratos: 3.9, grasas: 0.2, calorias: 18 },
  { id: 31, nombre: 'Lechuga', categoria: 'vegetal', proteinas: 1.2, carbohidratos: 2.9, grasas: 0.2, calorias: 15 },
  { id: 32, nombre: 'Pepino', categoria: 'vegetal', proteinas: 0.7, carbohidratos: 3.6, grasas: 0.1, calorias: 16 },
];

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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarPlan(diario, numComidas, alimentos) {
  const proteinas = shuffle(alimentos.filter((a) => a.categoria === 'proteina'));
  const carbos = shuffle(alimentos.filter((a) => a.categoria === 'carbohidrato'));
  const grasas = shuffle(alimentos.filter((a) => a.categoria === 'grasa'));
  const vegetales = shuffle(alimentos.filter((a) => a.categoria === 'vegetal'));

  if (!proteinas.length || !carbos.length || !grasas.length || !vegetales.length) {
    return null;
  }

  const porComida = {
    proteinas: diario.proteinas / numComidas,
    carbohidratos: diario.carbohidratos / numComidas,
    grasas: diario.grasas / numComidas,
    calorias: diario.calorias / numComidas,
  };

  const nombresComidas = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Comida', 'Post-entreno'];
  const planes = [];

  for (let i = 0; i < numComidas; i++) {
    const pSrc = proteinas[i % proteinas.length];
    const cSrc = carbos[i % carbos.length];
    const gSrc = grasas[i % grasas.length];
    const vSrc = vegetales[i % vegetales.length];

    const gP = Math.max(Math.round((porComida.proteinas * 0.5) / (pSrc.proteinas / 100)), 0);
    const gC = Math.max(Math.round((porComida.carbohidratos * 0.6) / (cSrc.carbohidratos / 100)), 0);
    const gG = Math.max(Math.round((porComida.grasas * 0.5) / (gSrc.grasas / 100)), 0);
    const gV = 100;

    const items = [
      { nombre: pSrc.nombre, gramos: gP, proteinas: (gP * pSrc.proteinas / 100).toFixed(1), carbohidratos: (gP * pSrc.carbohidratos / 100).toFixed(1), grasas: (gP * pSrc.grasas / 100).toFixed(1), calorias: Math.round(gP * pSrc.calorias / 100) },
      { nombre: cSrc.nombre, gramos: gC, proteinas: (gC * cSrc.proteinas / 100).toFixed(1), carbohidratos: (gC * cSrc.carbohidratos / 100).toFixed(1), grasas: (gC * cSrc.grasas / 100).toFixed(1), calorias: Math.round(gC * cSrc.calorias / 100) },
      { nombre: gSrc.nombre, gramos: gG, proteinas: (gG * gSrc.proteinas / 100).toFixed(1), carbohidratos: (gG * gSrc.carbohidratos / 100).toFixed(1), grasas: (gG * gSrc.grasas / 100).toFixed(1), calorias: Math.round(gG * gSrc.calorias / 100) },
      { nombre: vSrc.nombre, gramos: gV, proteinas: (gV * vSrc.proteinas / 100).toFixed(1), carbohidratos: (gV * vSrc.carbohidratos / 100).toFixed(1), grasas: (gV * vSrc.grasas / 100).toFixed(1), calorias: Math.round(gV * vSrc.calorias / 100) },
    ];

    const totalP = items.reduce((s, it) => s + parseFloat(it.proteinas), 0).toFixed(1);
    const totalC = items.reduce((s, it) => s + parseFloat(it.carbohidratos), 0).toFixed(1);
    const totalG = items.reduce((s, it) => s + parseFloat(it.grasas), 0).toFixed(1);
    const totalCal = items.reduce((s, it) => s + it.calorias, 0);

    planes.push({
      nombre: nombresComidas[i] || `Comida ${i + 1}`,
      items,
      totalP,
      totalC,
      totalG,
      totalCal,
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
  const [alimentos, setAlimentos] = useState(ALIMENTOS_FALLBACK);
  const [resultado, setResultado] = useState(null);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/alimentos')
      .then((res) => {
        if (res.data && res.data.length) setAlimentos(res.data);
      })
      .catch(() => {
        // Usar alimentos por defecto si la API falla
      });
  }, []);

  function calcular() {
    const peso = parseFloat(form.peso);
    const talla = parseFloat(form.talla);
    const edad = parseInt(form.edad);
    if (!peso || !talla || !edad) return showToast('Completa peso, talla y edad', 'error');
    if (!form.nombres.trim()) return showToast('Ingresa los nombres', 'error');

    setGenerating(true);

    const bmr = Math.round(calcularBMR(peso, talla, edad, form.genero));
    const tdee = Math.round(bmr * parseFloat(form.actividad));
    const proteinas = Math.round(2 * peso);
    const grasas = Math.round(1 * peso);
    const calProte = proteinas * 4;
    const calGras = grasas * 9;
    const calRest = Math.max(tdee - calProte - calGras, 0);
    const carbohidratos = Math.round(calRest / 4);

    const diario = { bmr, tdee, proteinas, grasas, carbohidratos, calorias: tdee };
    const plan = generarPlan(diario, parseInt(form.comidas), alimentos);

    if (!plan) {
      showToast('Error al generar el plan: datos de alimentos insuficientes', 'error');
      setGenerating(false);
      return;
    }

    setResultado({
      persona: { nombres: form.nombres, apellidos: form.apellidos, celular: form.celular, peso, talla, edad, genero: form.genero },
      diario,
      ...plan,
    });
    setGenerating(false);
  }

  function limpiar() {
    setResultado(null);
    setForm({ nombres: '', apellidos: '', celular: '', peso: '', talla: '', edad: '', genero: 'masculino', actividad: 1.55, comidas: 4 });
  }

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
                <button onClick={calcular} disabled={generating} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all disabled:opacity-50">
                  {generating ? 'Generando...' : 'Generar plan'}
                </button>
                <button onClick={limpiar} className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#888] border border-[#333] hover:bg-[#1a1a1a] transition-all">
                  Limpiar
                </button>
              </div>

              {resultado && (
                <div className="mt-4 bg-[#111] border border-[#222] rounded-lg p-3.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#555]">IMC</span>
                    <span className="text-sm font-bold text-white">{IMC}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#555]">TMB</span>
                    <span className="text-sm font-bold text-[#7ec84e]">{resultado.diario.bmr} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#555]">TDEE</span>
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
                    <div className="text-[10px] text-[#555] uppercase tracking-wider">{resultado.persona.nombres} {resultado.persona.apellidos} &middot; {resultado.persona.edad} años &middot; {resultado.persona.peso}kg / {resultado.persona.talla}cm</div>
                    <div className="flex justify-center gap-6 mt-2">
                      <div className="text-center"><div className="text-lg font-extrabold text-[#7ec84e]">{resultado.diario.proteinas}g</div><div className="text-[10px] text-[#555]">Proteínas</div></div>
                      <div className="text-center"><div className="text-lg font-extrabold text-[#e8884e]">{resultado.diario.carbohidratos}g</div><div className="text-[10px] text-[#555]">Carbohidratos</div></div>
                      <div className="text-center"><div className="text-lg font-extrabold text-prime-blue">{resultado.diario.grasas}g</div><div className="text-[10px] text-[#555]">Grasas</div></div>
                      <div className="text-center"><div className="text-lg font-extrabold text-white">{resultado.diario.calorias}</div><div className="text-[10px] text-[#555]">Calorías</div></div>
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
