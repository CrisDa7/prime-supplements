import { formatMoney, formatDateFull } from '../lib/utils';

export default function ComprobanteModal({ venta, onClose }) {
  if (!venta) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl w-[540px] max-w-[95vw] max-h-[90vh] flex flex-col">
        <div className="flex-1 overflow-y-auto p-7 pb-0">
          <div className="comprobante-print">
            <div className="text-center mb-5 pb-4 border-b border-dashed border-[#333]">
              <img src="/logo.png" alt="Prime Supplements" className="h-16 w-auto mx-auto mb-2" />
              <div className="text-lg font-extrabold text-white tracking-wider">PRIME SUPPLEMENTS</div>
              <div className="text-xs text-[#666] mt-1">Comprobante de venta</div>
            </div>

            <div className="mb-3.5 space-y-1.5">
              <div className="flex justify-between text-sm border-b border-[#1e1e1e] py-1.5">
                <span className="text-[#888]">Fecha:</span>
                <span className="text-[#ccc]">{formatDateFull(venta.fecha)}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-[#1e1e1e] py-1.5">
                <span className="text-[#888]">N° Venta:</span>
                <span className="text-[#ccc]">#{String(venta.id).padStart(4, '0')}</span>
              </div>
            </div>

            <div className="mb-3.5">
              <div className="text-[11px] text-[#666] uppercase tracking-wide mb-2">Cliente</div>
              <div className="flex justify-between text-sm border-b border-[#1e1e1e] py-1.5">
                <span className="text-[#888]">Nombre:</span>
                <span className="text-[#ccc]">{venta.cliente}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-[#888]">Telefono:</span>
                <span className="text-[#ccc]">{venta.telefono || '—'}</span>
              </div>
            </div>

            <div className="mb-3.5">
              <div className="text-[11px] text-[#666] uppercase tracking-wide mb-2">Detalle</div>
              <div className="flex justify-between text-sm border-b border-[#1e1e1e] py-1.5">
                <span className="text-[#888]">Producto:</span>
                <span className="text-[#ccc]">{venta.producto_nombre || '—'}</span>
              </div>
              {venta.producto_sabor && (
                <div className="flex justify-between text-sm border-b border-[#1e1e1e] py-1.5">
                  <span className="text-[#888]">Sabor:</span>
                  <span className="text-[#ccc]">{venta.producto_sabor}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-b border-[#1e1e1e] py-1.5">
                <span className="text-[#888]">Precio unit.:</span>
                <span className="text-[#ccc]">{formatMoney(venta.total / venta.cantidad)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-[#888]">Cantidad:</span>
                <span className="text-[#ccc]">{venta.cantidad}</span>
              </div>
            </div>

            <div className="flex justify-between pt-3 pb-1.5 border-t border-dashed border-[#333] mt-2 text-base font-bold text-white">
              <span>TOTAL</span>
              <span className="text-[22px]">{formatMoney(venta.total)}</span>
            </div>

            <div className="text-center mt-4 pt-4 border-t border-dashed border-[#333] text-sm text-[#888]">
              <p>Gracias por tu compra</p>
              <p className="text-[11px] text-[#888] mt-1">Prime Supplements — Tu tienda de confianza</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 justify-end p-7 pt-4 border-t border-[#222] sticky bottom-0 bg-[#181818]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-bold text-[#888] bg-transparent border border-[#333] hover:bg-[#1a1a1a] hover:text-[#bbb] transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}