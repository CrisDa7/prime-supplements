import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconLayoutDashboard, IconPackage, IconShoppingCart,
  IconChartBar, IconRefresh, IconUsers, IconLogout, IconX, IconScale,
} from '@tabler/icons-react';

const navItems = [
  { to: '/dashboard', icon: IconLayoutDashboard, label: 'Dashboard' },
  { to: '/productos', icon: IconPackage, label: 'Productos' },
  { to: '/ventas', icon: IconShoppingCart, label: 'Ventas' },
  { to: '/ganancias', icon: IconChartBar, label: 'Ganancias' },
  { to: '/stock', icon: IconRefresh, label: 'Actualizar Stock' },
  { to: '/imc', icon: IconScale, label: 'Calculadora IMC' },
  { to: '/usuarios', icon: IconUsers, label: 'Usuarios' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleNavClick() {
    if (onClose) onClose();
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-[220px] max-w-[80vw] bg-[#111] border-r border-[#1f1f1f] flex flex-col shrink-0 overflow-y-auto
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="px-4 pt-1 pb-1.5 border-b border-[#1f1f1f]">
          <div className="flex items-center">
            <div className="flex-1 md:hidden" />
            <img src="/logo.png" alt="Prime Supplements" className="h-11 w-auto mx-auto" />
            <div className="flex-1 flex justify-end md:hidden">
              <button onClick={onClose} className="text-[#888] hover:text-[#bbb] p-1">
                <IconX size={20} />
              </button>
            </div>
          </div>
          <div className="text-center leading-none">
            <span className="text-[10px] text-[#888]">Bienvenido, <strong className="text-[#aaa]">{user?.nombre || 'Usuario'}</strong></span>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 text-sm rounded-lg border-l-[3px] transition-all ${
                  isActive
                    ? 'text-prime-blue bg-[#1a2233] border-l-prime-blue'
                    : 'text-[#666] border-l-transparent hover:text-[#bbb] hover:bg-[#1a1a1a]'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 pt-3 border-t border-[#1f1f1f] space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#666] hover:text-[#e05454] hover:bg-[#1e1010] rounded-lg w-full transition-colors"
          >
            <IconLogout size={17} />
            Cerrar sesión
          </button>
          <div className="text-[11px] text-[#444] px-1">Prime Supplements v2.0</div>
        </div>
      </aside>
    </>
  );
}
