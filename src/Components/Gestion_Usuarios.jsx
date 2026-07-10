import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import '../Style/Gestion_Usuarios';
import {url} from "../App"

const Gestion_Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const availableRoles = ['Administrador', 'Recepcionista', 'Mecanico', 'Cliente'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/usuarios`);
      if (!response.ok) throw new Error('Error al obtener los usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/usuarios/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !currentStatus }),
      });
      
      if (!response.ok) throw new Error('Error al cambiar el estado');
      
      const updatedUser = await response.json();
      
      setUsers(users.map(u => (u.id === id ? { ...u, activo: updatedUser.activo } : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (id, newRoleName) => {
    try {
      const response = await fetch(`/api/usuarios/${id}/rol`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolNombre: newRoleName }),
      });

      if (!response.ok) throw new Error('Error al actualizar el rol');
      
      const updatedUser = await response.json();
      
      setUsers(users.map(u => (u.id === id ? { ...u, rol: updatedUser.rol } : u)));
    } catch (err) {
      alert(err.message);
      fetchUsers(); 
    }
  };

  return (
    <div className="management-container">
      
      <section className="management-hero">
        <div className="management-hero-content">
          <h1 className="management-hero-title">
            <span className="text-white">GESTIÓN DE</span> <span className="text-red">USUARIOS</span>
          </h1>
          <p className="management-hero-subtitle">ADMINISTRACIÓN DE ACCESOS, ROLES Y SUCURSALES</p>
        </div>
      </section>

      <main className="management-main">
        
        <div className="section-header">
          <Users className="section-icon text-red" size={24} />
          <h2 className="section-title">DIRECTORIO DEL SISTEMA</h2>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>USUARIO / EMAIL</th>
                <th>SUCURSAL</th>
                <th>ROL DEL SISTEMA</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray">Cargando usuarios...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray">No hay usuarios registrados.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={!user.activo ? 'row-inactive' : ''}>
                    
                    <td>
                      <div className="user-info-cell">
                        <span className="user-name">{user.nombre}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="branch-badge">
                        {user.sucursal?.nombre || 'Sin Asignar'}
                      </span>
                    </td>

                    <td>
                      <div className="role-select-wrapper">
                        <Shield size={14} className="role-icon" />
                        <select 
                          className="role-select"
                          value={user.rol?.nombre || ''}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={!user.activo}
                        >
                          <option value="" disabled>Seleccionar Rol</option>
                          {availableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge ${user.activo ? 'badge-active' : 'badge-inactive'}`}>
                        {user.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>

                    <td>
                      <button 
                        className={`btn-action ${user.activo ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => toggleUserStatus(user.id, user.activo)}
                      >
                        {user.activo ? (
                          <>
                            <XCircle size={16} />
                            <span>SUSPENDER</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            <span>ACTIVAR</span>
                          </>
                        )}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Gestion_Usuarios;