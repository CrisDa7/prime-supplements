import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { formatDate } from '../lib/utils';
import { IconUserPlus, IconEdit, IconTrash } from '@tabler/icons-react';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'administrador' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadUsuarios(); }, []);

  async function loadUsuarios() {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch { showToast('Error al cargar usuarios', 'error'); }
  }

  function openCreate() {
    setEditingUser(null);
    setForm({ nombre: '', email: '', password: '', rol: 'administrador' });
    setShowForm(true);
  }

  function openEdit(u) {
    setEditingUser(u);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
    setForm({ nombre: '', email: '', password: '', rol: 'administrador' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return showToast('Ingresa el nombre', 'error');
    if (!form.email.trim()) return showToast('Ingresa el email', 'error');
    if (!editingUser && !form.password) return showToast('Ingresa la contraseña', 'error');
    setLoading(true);
    try {
      if (editingUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/usuarios/${editingUser.id}`, payload);
        showToast('Usuario actualizado');
      } else {
        await api.post('/usuarios', form);
        showToast('Usuario creado exitosamente');
      }
      closeForm();
      loadUsuarios();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al guardar usuario', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      showToast('Usuario eliminado');
      loadUsuarios();
    } catch { showToast('Error al eliminar', 'error'); }
  }

  return (
    <>
      <Topbar title="Usuarios" subtitle="Gestiona los usuarios del sistema" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Usuarios registrados</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-prime-blue hover:bg-[#2563eb] transition-all inline-flex items-center gap-1.5"
          >
            <IconUserPlus size={16} /> Nuevo usuario
          </button>
        </div>

        {showForm && (
          <div className="card p-5 mb-5">
            <h3 className="text-[15px] font-bold text-[#ddd] mb-4">
              {editingUser ? 'Editar usuario' : 'Crear nuevo usuario'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3.5 mb-3.5 max-md:grid-cols-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Nombre *</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" className="input" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" className="input" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">{editingUser ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *'}</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? '•••••••• (opcional)' : '••••••••'} className="input" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#777] font-medium">Rol</label>
                  <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="input">
                    <option value="administrador">Administrador</option>
                    <option value="vendedor">Vendedor</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2.5 justify-end mt-4">
                <button type="button" onClick={closeForm} className="btn-ghost">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#141414] text-[#555] text-[11px] uppercase tracking-wide">
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Nombre</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Email</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Rol</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Creado</th>
                  <th className="text-left px-3.5 py-2.5 border-b border-[#222] font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length ? usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1c1c1c]">
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]"><strong className="text-[#ddd]">{u.nombre}</strong></td>
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#ccc]">{u.email}</td>
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                      <span className={u.rol === 'administrador' ? 'badge-ok' : 'badge-low'}>{u.rol}</span>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e] text-[#555] text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-3.5 py-2.5 border-b border-[#1e1e1e]">
                      <button onClick={() => openEdit(u)} className="text-[#888] hover:text-[#bbb] p-1.5 rounded-lg hover:bg-[#1a1a1a] transition-all" title="Editar">
                        <IconEdit size={15} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-[#e05454] hover:text-[#ff6b4a] p-1.5 rounded-lg hover:bg-[#1e1010] transition-all ml-1" title="Eliminar">
                        <IconTrash size={15} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center text-[#555] py-5">Sin usuarios registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}