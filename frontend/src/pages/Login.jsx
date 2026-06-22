import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nombre: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, form);
      login(res.data);
      showToast(isRegister ? 'Cuenta creada exitosamente' : 'Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 401 ? 'Credenciales incorrectas' : (err.response?.data?.error || 'Error del servidor');
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8 w-full max-w-[420px]">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Prime Supplements" className="h-48 w-auto mx-auto" />
        </div>

        <h2 className="text-lg font-bold text-[#e8e8e8] mb-5 text-center">
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#777] font-medium">Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre"
                className="bg-[#0d0d0d] border border-[#2a2a2a] text-[#ccc] px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#777] font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              className="bg-[#0d0d0d] border border-[#2a2a2a] text-[#ccc] px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#777] font-medium">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="bg-[#0d0d0d] border border-[#2a2a2a] text-[#ccc] px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-prime-blue focus:ring-2 focus:ring-prime-blue/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-prime-blue text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#2563eb] transition-all disabled:opacity-50"
          >
            {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        {isRegister && (
          <p className="text-center text-xs text-[#555] mt-5">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-prime-blue hover:underline font-medium"
            >
              Inicia sesión
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
