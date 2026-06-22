export function formatMoney(n) {
  return '$' + parseFloat(n).toFixed(2);
}

export function formatDate(date) {
  const d = new Date(date);
  const hoy = new Date();
  const ayer = new Date(hoy - 86400000);
  const timeStr = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === hoy.toDateString()) return 'Hoy ' + timeStr;
  if (d.toDateString() === ayer.toDateString()) return 'Ayer ' + timeStr;
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' }) + ' ' + timeStr;
}

export function formatDateFull(date) {
  return new Date(date).toLocaleDateString('es', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
