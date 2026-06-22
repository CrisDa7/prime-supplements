/* ==========================================
   PRIME SUPPLEMENTS — app.js
   ========================================== */

// ===== DATA STORE =====
let DB = {
  productos: [],
  ventas: [],
  movimientos: [],
  stockHistorial: []
};

// ===== INICIALIZAR DATOS DE EJEMPLO =====
function initDemoData() {
  DB.productos = [
    { id: 1, nombre: 'Whey Protein Gold 5lb', sabor: 'Chocolate', compra: 42, venta: 65, stock: 12, minStock: 5 },
    { id: 2, nombre: 'Creatina Monohidrato 500g', sabor: '', compra: 18, venta: 28, stock: 8, minStock: 3 },
    { id: 3, nombre: 'Pre-Workout Extreme', sabor: 'Sandía', compra: 28, venta: 42, stock: 3, minStock: 5 },
    { id: 4, nombre: 'BCAA Amino 300g', sabor: 'Naranja', compra: 22, venta: 35, stock: 15, minStock: 4 },
    { id: 5, nombre: 'L-Carnitina Líquida 500ml', sabor: 'Fresa', compra: 15, venta: 25, stock: 2, minStock: 4 },
    { id: 6, nombre: 'Glutamina 400g', sabor: '', compra: 20, venta: 32, stock: 7, minStock: 3 },
  ];

  const now = new Date();
  const hace2h = new Date(now - 2 * 3600000);
  const ayer = new Date(now - 86400000);
  const hace3d = new Date(now - 3 * 86400000);

  DB.ventas = [
    { id: 1, cliente: 'Carlos Mendoza', telefono: '099-1234567', productoId: 1, cantidad: 1, total: 65, fecha: hace2h },
    { id: 2, cliente: 'Ana Rodríguez', telefono: '098-7654321', productoId: 2, cantidad: 2, total: 56, fecha: hace2h },
    { id: 3, cliente: 'Luis Torres', telefono: '097-1122334', productoId: 3, cantidad: 1, total: 42, fecha: ayer },
    { id: 4, cliente: 'María Sánchez', telefono: '096-9988776', productoId: 4, cantidad: 1, total: 35, fecha: ayer },
  ];

  DB.movimientos = [
    { id: 1, tipo: 'egreso', desc: 'Compra inicial stock — Proveedor MuscleTech', monto: 420, fecha: hace3d },
    { id: 2, tipo: 'egreso', desc: 'Compra inicial stock — Proveedor NutriFit', monto: 310, fecha: hace3d },
    { id: 3, tipo: 'ingreso', desc: 'Venta — Carlos Mendoza (Whey Protein Gold 5lb)', monto: 65, fecha: hace2h },
    { id: 4, tipo: 'ingreso', desc: 'Venta — Ana Rodríguez (Creatina x2)', monto: 56, fecha: hace2h },
    { id: 5, tipo: 'ingreso', desc: 'Venta — Luis Torres (Pre-Workout)', monto: 42, fecha: ayer },
    { id: 6, tipo: 'ingreso', desc: 'Venta — María Sánchez (BCAA)', monto: 35, fecha: ayer },
  ];

  DB.stockHistorial = [
    { id: 1, productoId: 1, cantidad: 12, precio: 42, nota: 'Stock inicial', fecha: hace3d },
    { id: 2, productoId: 2, cantidad: 10, precio: 18, nota: 'Stock inicial', fecha: hace3d },
  ];
}

// ===== STORAGE =====
function saveDB() {
  try { localStorage.setItem('prime_db', JSON.stringify(DB)); } catch(e) {}
}

function loadDB() {
  try {
    const d = localStorage.getItem('prime_db');
    if (d) {
      const parsed = JSON.parse(d);
      // Restore dates
      if (parsed.ventas) parsed.ventas.forEach(v => v.fecha = new Date(v.fecha));
      if (parsed.movimientos) parsed.movimientos.forEach(m => m.fecha = new Date(m.fecha));
      if (parsed.stockHistorial) parsed.stockHistorial.forEach(s => s.fecha = new Date(s.fecha));
      DB = parsed;
      return true;
    }
  } catch(e) {}
  return false;
}

// ===== UTILS =====
function formatMoney(n) { return '$' + parseFloat(n).toFixed(2); }
function formatDate(d) {
  const date = new Date(d);
  const hoy = new Date();
  const ayer = new Date(hoy - 86400000);
  const timeStr = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === hoy.toDateString()) return 'Hoy ' + timeStr;
  if (date.toDateString() === ayer.toDateString()) return 'Ayer ' + timeStr;
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short' }) + ' ' + timeStr;
}
function formatDateFull(d) {
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

function getProducto(id) { return DB.productos.find(p => p.id == id); }

function stockBajo(p) { return p.stock <= p.minStock; }

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2800);
}

// ===== NAVIGATION =====
const pageTitles = {
  dashboard: ['Dashboard', 'Resumen general de tu negocio'],
  productos: ['Productos', 'Gestiona tu catálogo de suplementos'],
  ventas: ['Nueva Venta', 'Registra ventas y genera comprobantes'],
  ganancias: ['Ganancias & Reportes', 'Ingresos, egresos y utilidad neta'],
  stock: ['Actualizar Stock', 'Añade inventario a tus productos']
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick').includes("'" + name + "'")) n.classList.add('active');
  });
  const [title, sub] = pageTitles[name];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = sub;

  // Render on navigation
  if (name === 'dashboard') renderDashboard();
  if (name === 'productos') renderProductos();
  if (name === 'ventas') { renderVentas(); populateProductoSelect('venta-producto'); }
  if (name === 'ganancias') renderGanancias();
  if (name === 'stock') { renderStock(); populateProductoSelect('stock-producto'); }
}

function switchTab(page, tab) {
  if (page === 'prod') {
    document.getElementById('prod-list').style.display = tab === 'list' ? 'block' : 'none';
    document.getElementById('prod-new').style.display = tab === 'new' ? 'block' : 'none';
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', (i === 0 && tab === 'list') || (i === 1 && tab === 'new'));
    });
    if (tab === 'list') renderProductos();
    if (tab === 'new') {
      document.getElementById('prod-nombre').value = '';
      document.getElementById('prod-sabor').value = '';
      document.getElementById('prod-compra').value = '';
      document.getElementById('prod-venta').value = '';
      document.getElementById('prod-cantidad').value = '';
      document.getElementById('prod-minstock').value = '5';
      document.getElementById('profit-preview').style.display = 'none';
    }
  }
}

// ===== DASHBOARD =====
function renderDashboard() {
  const totalVentas = DB.movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  const totalEgresos = DB.movimientos.filter(m => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
  const ganancia = totalVentas - totalEgresos;
  const margen = totalVentas > 0 ? ((ganancia / totalVentas) * 100).toFixed(1) : 0;

  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Ingresos totales</div><div class="stat-value">${formatMoney(totalVentas)}</div><div class="stat-sub">Todas las ventas</div></div>
    <div class="stat-card neutral"><div class="stat-label">Egresos (compras)</div><div class="stat-value" style="color:#8ac0ff">${formatMoney(totalEgresos)}</div><div class="stat-sub">Capital invertido</div></div>
    <div class="stat-card"><div class="stat-label">Ganancia neta</div><div class="stat-value">${formatMoney(ganancia)}</div><div class="stat-sub">Margen ${margen}%</div></div>
    <div class="stat-card"><div class="stat-label">Productos activos</div><div class="stat-value">${DB.productos.length}</div><div class="stat-sub">${DB.productos.filter(stockBajo).length} con stock bajo</div></div>
  `;

  // Recent sales
  const tbody = document.querySelector('#dashboard-recent-sales tbody');
  const recent = [...DB.ventas].reverse().slice(0, 6);
  tbody.innerHTML = recent.length ? recent.map(v => {
    const prod = getProducto(v.productoId);
    return `<tr><td>${v.cliente}</td><td>${prod ? prod.nombre : '—'}</td><td>${v.cantidad}</td><td class="amount-pos">${formatMoney(v.total)}</td></tr>`;
  }).join('') : '<tr><td colspan="4" style="text-align:center;color:#555;padding:20px">Sin ventas registradas</td></tr>';

  // Low stock
  const lowPanel = document.getElementById('low-stock-panel');
  const lowItems = DB.productos.filter(stockBajo);
  lowPanel.innerHTML = lowItems.length ? lowItems.map(p =>
    `<div class="low-stock-item"><div><div class="low-stock-name">${p.nombre}</div><div style="font-size:11px;color:#555">${p.sabor || 'Sin sabor'}</div></div><div class="low-stock-qty">⚠ ${p.stock} und</div></div>`
  ).join('') : '<div style="padding:20px;text-align:center;color:#555;font-size:13px">✓ Todo el stock está OK</div>';
}

// ===== PRODUCTOS =====
function renderProductos() {
  const search = (document.getElementById('search-productos')?.value || '').toLowerCase();
  const tbody = document.querySelector('#tabla-productos tbody');
  let prods = DB.productos;
  if (search) prods = prods.filter(p => p.nombre.toLowerCase().includes(search) || (p.sabor || '').toLowerCase().includes(search));

  tbody.innerHTML = prods.length ? prods.map(p => {
    const ganancia = p.venta - p.compra;
    const margen = p.compra > 0 ? ((ganancia / p.compra) * 100).toFixed(0) : 0;
    const bajo = stockBajo(p);
    return `
      <tr>
        <td><strong style="color:#ddd">${p.nombre}</strong></td>
        <td>${p.sabor ? `<span class="flavor-tag">${p.sabor}</span>` : '<span style="color:#444">—</span>'}</td>
        <td>${formatMoney(p.compra)}</td>
        <td style="color:#c8ff00;font-weight:700">${formatMoney(p.venta)}</td>
        <td><strong style="color:${bajo ? '#e8884e' : '#ccc'}">${p.stock}</strong> und</td>
        <td><span style="color:#7ec84e">${formatMoney(ganancia)}</span> <span style="color:#555;font-size:11px">(${margen}%)</span></td>
        <td>${bajo ? '<span class="badge-low">⚠ Bajo</span>' : '<span class="badge-ok">OK</span>'}</td>
        <td>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="abrirEditar(${p.id})" title="Editar"><i class="ti ti-edit"></i></button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="eliminarProducto(${p.id})" title="Eliminar"><i class="ti ti-trash"></i></button>
        </td>
      </tr>`;
  }).join('') : '<tr><td colspan="8" style="text-align:center;color:#555;padding:24px">No se encontraron productos</td></tr>';
}

// Calcular ganancia en tiempo real al escribir precios
document.addEventListener('DOMContentLoaded', function() {
  ['prod-compra', 'prod-venta'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcularGananciaPreview);
  });
});

function calcularGananciaPreview() {
  const compra = parseFloat(document.getElementById('prod-compra').value) || 0;
  const venta = parseFloat(document.getElementById('prod-venta').value) || 0;
  const preview = document.getElementById('profit-preview');
  if (compra > 0 && venta > 0) {
    const gan = venta - compra;
    const pct = ((gan / compra) * 100).toFixed(1);
    document.getElementById('profit-amount').textContent = formatMoney(gan);
    document.getElementById('profit-pct').textContent = `(${pct}% de margen)`;
    preview.style.display = 'flex';
    document.getElementById('profit-amount').style.color = gan >= 0 ? '#c8ff00' : '#e05454';
  } else {
    preview.style.display = 'none';
  }
}

function guardarProducto() {
  const nombre = document.getElementById('prod-nombre').value.trim();
  const sabor = document.getElementById('prod-sabor').value.trim();
  const compra = parseFloat(document.getElementById('prod-compra').value);
  const venta = parseFloat(document.getElementById('prod-venta').value);
  const cantidad = parseInt(document.getElementById('prod-cantidad').value);
  const minStock = parseInt(document.getElementById('prod-minstock').value) || 5;

  if (!nombre) return showToast('Ingresa el nombre del producto', 'error');
  if (isNaN(compra) || compra < 0) return showToast('Precio de compra inválido', 'error');
  if (isNaN(venta) || venta < 0) return showToast('Precio de venta inválido', 'error');
  if (isNaN(cantidad) || cantidad < 0) return showToast('Cantidad inválida', 'error');

  const prod = { id: nextId(DB.productos), nombre, sabor, compra, venta, stock: cantidad, minStock };
  DB.productos.push(prod);

  // Registrar egreso de compra inicial
  const total = compra * cantidad;
  if (total > 0) {
    DB.movimientos.push({ id: nextId(DB.movimientos), tipo: 'egreso', desc: `Compra inicial — ${nombre} x${cantidad}`, monto: total, fecha: new Date() });
    DB.stockHistorial.push({ id: nextId(DB.stockHistorial), productoId: prod.id, cantidad, precio: compra, nota: 'Stock inicial', fecha: new Date() });
  }

  saveDB();
  showToast(`✓ Producto "${nombre}" registrado exitosamente`);
  switchTab('prod', 'list');
}

function eliminarProducto(id) {
  const prod = getProducto(id);
  if (!prod) return;
  if (!confirm(`¿Eliminar "${prod.nombre}"? Esta acción no se puede deshacer.`)) return;
  DB.productos = DB.productos.filter(p => p.id !== id);
  saveDB();
  showToast('Producto eliminado');
  renderProductos();
  renderDashboard();
}

function abrirEditar(id) {
  const p = getProducto(id);
  if (!p) return;
  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-nombre').value = p.nombre;
  document.getElementById('edit-sabor').value = p.sabor || '';
  document.getElementById('edit-compra').value = p.compra;
  document.getElementById('edit-venta').value = p.venta;
  document.getElementById('edit-minstock').value = p.minStock;
  document.getElementById('modal-editar').style.display = 'flex';
}

function guardarEdicion() {
  const id = parseInt(document.getElementById('edit-id').value);
  const p = getProducto(id);
  if (!p) return;
  const nombre = document.getElementById('edit-nombre').value.trim();
  const sabor = document.getElementById('edit-sabor').value.trim();
  const compra = parseFloat(document.getElementById('edit-compra').value);
  const venta = parseFloat(document.getElementById('edit-venta').value);
  const minStock = parseInt(document.getElementById('edit-minstock').value) || 5;

  if (!nombre) return showToast('Nombre requerido', 'error');
  if (isNaN(compra) || isNaN(venta)) return showToast('Precios inválidos', 'error');

  p.nombre = nombre; p.sabor = sabor; p.compra = compra; p.venta = venta; p.minStock = minStock;
  saveDB();
  document.getElementById('modal-editar').style.display = 'none';
  showToast('✓ Producto actualizado');
  renderProductos();
}

function cerrarModalEditar(e) {
  if (e.target === document.getElementById('modal-editar')) document.getElementById('modal-editar').style.display = 'none';
}

// ===== VENTAS =====
function populateProductoSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">— Seleccionar producto —</option>';
  DB.productos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.nombre}${p.sabor ? ' (' + p.sabor + ')' : ''} — Stock: ${p.stock}`;
    if (p.stock === 0) { opt.disabled = true; opt.textContent += ' [Sin stock]'; }
    sel.appendChild(opt);
  });
  if (prev) sel.value = prev;
}

function calcularVenta() {
  const prodId = document.getElementById('venta-producto').value;
  const cant = parseInt(document.getElementById('venta-cantidad').value) || 1;
  const resumen = document.getElementById('venta-resumen');
  if (!prodId) { resumen.style.display = 'none'; return; }
  const prod = getProducto(parseInt(prodId));
  if (!prod) { resumen.style.display = 'none'; return; }
  resumen.style.display = 'block';
  document.getElementById('res-precio').textContent = formatMoney(prod.venta);
  document.getElementById('res-cantidad').textContent = cant;
  document.getElementById('res-total').textContent = formatMoney(prod.venta * cant);
}

function renderVentas() {
  const tbody = document.querySelector('#tabla-ventas tbody');
  const recent = [...DB.ventas].reverse().slice(0, 20);
  tbody.innerHTML = recent.length ? recent.map(v => {
    const prod = getProducto(v.productoId);
    return `<tr>
      <td>${v.cliente}</td>
      <td style="color:#666;font-size:12px">${v.telefono || '—'}</td>
      <td>${prod ? prod.nombre : '—'}</td>
      <td>${v.cantidad}</td>
      <td class="amount-pos">${formatMoney(v.total)}</td>
      <td style="color:#555;font-size:12px">${formatDate(v.fecha)}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="verComprobante(${v.id})" title="Ver comprobante"><i class="ti ti-printer"></i></button></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" style="text-align:center;color:#555;padding:20px">Sin ventas registradas</td></tr>';
}

function registrarVenta() {
  const cliente = document.getElementById('venta-cliente').value.trim();
  const telefono = document.getElementById('venta-telefono').value.trim();
  const prodId = parseInt(document.getElementById('venta-producto').value);
  const cantidad = parseInt(document.getElementById('venta-cantidad').value);

  if (!cliente) return showToast('Ingresa el nombre del cliente', 'error');
  if (!prodId) return showToast('Selecciona un producto', 'error');
  if (!cantidad || cantidad < 1) return showToast('Cantidad inválida', 'error');

  const prod = getProducto(prodId);
  if (!prod) return showToast('Producto no encontrado', 'error');
  if (prod.stock < cantidad) return showToast(`Stock insuficiente. Disponible: ${prod.stock} und`, 'error');

  const total = prod.venta * cantidad;
  prod.stock -= cantidad;

  const venta = { id: nextId(DB.ventas), cliente, telefono, productoId: prodId, cantidad, total, fecha: new Date() };
  DB.ventas.push(venta);
  DB.movimientos.push({ id: nextId(DB.movimientos), tipo: 'ingreso', desc: `Venta — ${cliente} (${prod.nombre} x${cantidad})`, monto: total, fecha: new Date() });

  saveDB();
  showToast(`✓ Venta registrada. Total: ${formatMoney(total)}`);

  // Reset form
  document.getElementById('venta-cliente').value = '';
  document.getElementById('venta-telefono').value = '';
  document.getElementById('venta-producto').value = '';
  document.getElementById('venta-cantidad').value = '1';
  document.getElementById('venta-resumen').style.display = 'none';

  populateProductoSelect('venta-producto');
  renderVentas();

  // Auto show comprobante
  setTimeout(() => verComprobante(venta.id), 300);
}

// ===== COMPROBANTE =====
function verComprobante(ventaId) {
  const v = DB.ventas.find(x => x.id == ventaId);
  if (!v) return;
  const prod = getProducto(v.productoId);

  document.getElementById('comprobante-body').innerHTML = `
    <div style="margin-bottom:14px">
      <div class="comprobante-row"><span style="color:#888">Fecha:</span><span>${formatDateFull(v.fecha)}</span></div>
      <div class="comprobante-row"><span style="color:#888">N° Venta:</span><span>#${String(v.id).padStart(4,'0')}</span></div>
    </div>
    <div style="margin-bottom:14px">
      <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px">Cliente</div>
      <div class="comprobante-row"><span style="color:#888">Nombre:</span><span>${v.cliente}</span></div>
      <div class="comprobante-row"><span style="color:#888">Teléfono:</span><span>${v.telefono || '—'}</span></div>
    </div>
    <div>
      <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px">Detalle</div>
      <div class="comprobante-row"><span style="color:#888">Producto:</span><span>${prod ? prod.nombre : '—'}</span></div>
      ${prod && prod.sabor ? `<div class="comprobante-row"><span style="color:#888">Sabor:</span><span>${prod.sabor}</span></div>` : ''}
      <div class="comprobante-row"><span style="color:#888">Precio unit.:</span><span>${formatMoney(prod ? prod.venta : 0)}</span></div>
      <div class="comprobante-row"><span style="color:#888">Cantidad:</span><span>${v.cantidad}</span></div>
    </div>
    <div class="comprobante-total"><span>TOTAL</span><span style="font-size:22px">${formatMoney(v.total)}</span></div>
  `;
  document.getElementById('modal-comprobante').style.display = 'flex';
}

function imprimirComprobante() { window.print(); }

function cerrarModal(e) {
  if (e.target === document.getElementById('modal-comprobante')) {
    document.getElementById('modal-comprobante').style.display = 'none';
  }
}

// ===== GANANCIAS =====
function renderGanancias() {
  const filtro = document.getElementById('filtro-tipo')?.value || '';
  let movs = [...DB.movimientos].reverse();
  if (filtro) movs = movs.filter(m => m.tipo === filtro);

  const totalIngresos = DB.movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  const totalEgresos = DB.movimientos.filter(m => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
  const neta = totalIngresos - totalEgresos;
  const margen = totalIngresos > 0 ? ((neta / totalIngresos) * 100).toFixed(1) : 0;

  document.getElementById('ganancia-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Total ingresos</div><div class="stat-value">${formatMoney(totalIngresos)}</div><div class="stat-sub">Ventas acumuladas</div></div>
    <div class="stat-card"><div class="stat-label">Total egresos</div><div class="stat-value" style="color:#8ac0ff">${formatMoney(totalEgresos)}</div><div class="stat-sub">Compras de stock</div></div>
    <div class="stat-card"><div class="stat-label">Ganancia neta</div><div class="stat-value" style="color:${neta >= 0 ? '#c8ff00' : '#e05454'}">${formatMoney(neta)}</div><div class="stat-sub">${neta >= 0 ? '↑ Positivo' : '↓ Negativo'}</div></div>
    <div class="stat-card"><div class="stat-label">Margen global</div><div class="stat-value">${margen}%</div><div class="stat-sub">De rentabilidad</div></div>
  `;

  // Calcular saldo acumulado (cronológico)
  const cronologico = [...DB.movimientos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  let saldo = 0;
  const saldos = {};
  cronologico.forEach(m => {
    saldo += m.tipo === 'ingreso' ? m.monto : -m.monto;
    saldos[m.id] = saldo;
  });

  const tbody = document.querySelector('#tabla-ganancias tbody');
  tbody.innerHTML = movs.length ? movs.map(m => `
    <tr>
      <td style="color:#666;font-size:12px">${formatDate(m.fecha)}</td>
      <td><span class="badge-${m.tipo}">${m.tipo === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}</span></td>
      <td>${m.desc}</td>
      <td class="${m.tipo === 'ingreso' ? 'amount-pos' : 'amount-neg'}">${m.tipo === 'ingreso' ? '+' : '-'}${formatMoney(m.monto)}</td>
      <td style="color:#888">${formatMoney(saldos[m.id])}</td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="text-align:center;color:#555;padding:20px">Sin movimientos</td></tr>';
}

// ===== STOCK =====
function verStockActual() {
  const id = document.getElementById('stock-producto').value;
  const info = document.getElementById('stock-info');
  if (!id) { info.style.display = 'none'; return; }
  const prod = getProducto(parseInt(id));
  if (!prod) { info.style.display = 'none'; return; }
  document.getElementById('stock-actual-val').textContent = prod.stock;
  info.style.display = 'flex';
}

function actualizarStock() {
  const prodId = parseInt(document.getElementById('stock-producto').value);
  const cantidad = parseInt(document.getElementById('stock-cantidad').value);
  const precio = parseFloat(document.getElementById('stock-precio').value);
  const nota = document.getElementById('stock-nota').value.trim();

  if (!prodId) return showToast('Selecciona un producto', 'error');
  if (!cantidad || cantidad < 1) return showToast('Cantidad inválida', 'error');
  if (isNaN(precio) || precio < 0) return showToast('Precio de compra inválido', 'error');

  const prod = getProducto(prodId);
  if (!prod) return showToast('Producto no encontrado', 'error');

  prod.stock += cantidad;
  prod.compra = precio; // Actualizar precio de compra con el nuevo lote

  DB.stockHistorial.push({ id: nextId(DB.stockHistorial), productoId: prodId, cantidad, precio, nota, fecha: new Date() });
  DB.movimientos.push({ id: nextId(DB.movimientos), tipo: 'egreso', desc: `Compra stock — ${prod.nombre} x${cantidad}${nota ? ' (' + nota + ')' : ''}`, monto: precio * cantidad, fecha: new Date() });

  saveDB();
  showToast(`✓ Stock actualizado. ${prod.nombre}: ${prod.stock} unidades`);

  document.getElementById('stock-producto').value = '';
  document.getElementById('stock-cantidad').value = '';
  document.getElementById('stock-precio').value = '';
  document.getElementById('stock-nota').value = '';
  document.getElementById('stock-info').style.display = 'none';

  renderStock();
}

function renderStock() {
  populateProductoSelect('stock-producto');

  // Alertas
  const alertas = document.getElementById('stock-alertas');
  const bajos = DB.productos.filter(stockBajo);
  alertas.innerHTML = bajos.length ? bajos.map(p => `
    <div class="low-stock-item">
      <div>
        <div class="low-stock-name">${p.nombre}</div>
        <div style="font-size:11px;color:#555">${p.sabor || 'Sin sabor'} — Mínimo: ${p.minStock}</div>
      </div>
      <div class="low-stock-qty">⚠ ${p.stock} und</div>
    </div>
  `).join('') : '<div style="padding:20px;text-align:center;color:#555;font-size:13px">✓ Todo el stock está OK</div>';

  // Historial
  const tbody = document.querySelector('#tabla-stock-hist tbody');
  const hist = [...DB.stockHistorial].reverse().slice(0, 20);
  tbody.innerHTML = hist.length ? hist.map(h => {
    const prod = getProducto(h.productoId);
    return `<tr>
      <td style="color:#666;font-size:12px">${formatDate(h.fecha)}</td>
      <td>${prod ? prod.nombre : '—'}</td>
      <td class="amount-pos">+${h.cantidad} und</td>
      <td>${formatMoney(h.precio)}/und</td>
      <td style="color:#666">${h.nota || '—'}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="5" style="text-align:center;color:#555;padding:20px">Sin historial</td></tr>';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  const loaded = loadDB();
  if (!loaded) initDemoData();

  // Fecha en topbar
  const d = new Date();
  document.getElementById('current-date').textContent = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Calcular ganancia en form producto
  ['prod-compra', 'prod-venta'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcularGananciaPreview);
  });

  // Render inicial
  renderDashboard();
});
