import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, UserCog, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/Gestion_Usuarios.css';

const Gestion_Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recientes'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rolID: '6' 
  });

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/api/usuarios`, { headers: getAuthHeaders() });
      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        navigate('/');
        throw new Error('Sesión expirada.');
      }
      if (!response.ok) throw new Error('Error al obtener usuarios');
      
      const data = await response.json();
      if (Array.isArray(data)) setUsuarios(data);
      else if (data && Array.isArray(data.data)) setUsuarios(data.data);
      else setUsuarios([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. VALIDACIÓN DE SEGURIDAD (Solo Administradores)
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuarioActivo = JSON.parse(usuarioStr);
      // Validamos si es Admin por ID o por nombre de rol
      const esAdmin = usuarioActivo.rolId === 6 || usuarioActivo.rol?.nombre?.toLowerCase() === 'administrador' || usuarioActivo.rol === 'administrador';
      
      if (!esAdmin) {
        alert('ACCESO DENEGADO: No tienes permisos para gestionar usuarios.');
        navigate('/personal');
        return; // Detenemos la ejecución
      }
    } else {
      navigate('/');
      return;
    }

    // 2. Si pasa la validación, cargamos los datos
    fetchUsuarios();
    
  }, []);

  const handleSuspender = async (id) => {
    if (!window.confirm("¿Seguro que deseas cambiar el estado de este usuario?")) return;
    try {
      await fetch(`${URL}/api/usuarios/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      fetchUsuarios();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // ================= LÓGICA DE PROCESAMIENTO =================
  let processedUsuarios = usuarios.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.nombre || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.rol?.nombre || '').toLowerCase().includes(searchLower) ||
      (user.sucursal?.nombre || '').toLowerCase().includes(searchLower)
    );
  });

  if (sortOption === 'nombre-a-z') {
    processedUsuarios.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  } else if (sortOption === 'nombre-z-a') {
    processedUsuarios.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
  } else if (sortOption === 'activos') {
    processedUsuarios.sort((a, b) => (b.estado === true ? 1 : 0) - (a.estado === true ? 1 : 0));
  } else if (sortOption === 'inactivos') {
    processedUsuarios.sort((a, b) => (a.estado === true ? 1 : 0) - (b.estado === true ? 1 : 0));
  }

  const totalPages = Math.ceil(processedUsuarios.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedUsuarios.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption]);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // ================= MANEJO DEL MODAL DE CREACIÓN =================
  const openCreateModal = () => {
    setFormData({ nombre: '', email: '', password: '', rolID: '6' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { 
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rolID: Number(formData.rolID) 
      };

      const response = await fetch(`${URL}/api/auth/registro`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        navigate('/');
        throw new Error('Sesión expirada.');
      }
      
      if (!response.ok) {
        const errData = await response.json();
        const errorMsg = errData.errors ? errData.errors.map(e => e.msg).join(', ') : (errData.error || errData.message);
        throw new Error(errorMsg || 'Error al crear el usuario');
      }

      closeModal();
      fetchUsuarios(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminHeader />

      <div className="hero-banner">
        <div className="hero-content">
          <h1>GESTIÓN DE <span className="text-red">USUARIOS</span></h1>
          <p>ADMINISTRACIÓN DE ACCESOS, ROLES Y SUCURSALES</p>
        </div>
        <div className="hero-slash"></div>
      </div>

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-title-group">
            <UserCog size={24} color="#ef4444" />
            <h2 className="page-subtitle">DIRECTORIO DEL SISTEMA</h2>
          </div>
          
          <button className="btn-create-primary" onClick={openCreateModal}>
            <Plus size={16} strokeWidth={3} />
            <span>NUEVO USUARIO</span>
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="controls-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar nombre, correo, rol o sucursal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <Filter className="filter-icon" size={18} />
            <select 
              className="filter-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="recientes">Más Recientes</option>
              <option value="nombre-a-z">Nombre (A - Z)</option>
              <option value="nombre-z-a">Nombre (Z - A)</option>
              <option value="activos">Solo Activos</option>
              <option value="inactivos">Solo Inactivos</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
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
                <tr><td colSpan="5" className="text-center py-4 text-gray">Cargando base de datos...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray">No se encontraron usuarios.</td></tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="font-bold text-white">{user.nombre}</div>
                      <div className="text-gray" style={{fontSize: '0.8rem'}}>{user.email}</div>
                    </td>
                    <td>
                      <span className="badge-sucursal">{user.sucursal?.nombre || 'Central'}</span>
                    </td>
                    <td>
                      <span className="badge-rol">{user.rol?.nombre || 'Administrador'}</span>
                    </td>
                    <td>
                      <span className={`badge-estado ${user.estado ? 'activo' : 'inactivo'}`}>
                        {user.estado ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-text-action" onClick={() => handleSuspender(user.id)}>
                        {user.estado ? 'SUSPENDER' : 'ACTIVAR'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedUsuarios.length)} de {processedUsuarios.length}
            </span>
            <div className="pagination-controls">
              <button className="btn-page" onClick={prevPage} disabled={currentPage === 1}><ChevronLeft size={18} /></button>
              <span className="page-indicator">Página {currentPage} de {totalPages}</span>
              <button className="btn-page" onClick={nextPage} disabled={currentPage === totalPages}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL DE CREAR USUARIO ================= */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h3>CREAR NUEVO USUARIO</h3>
              <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>

              <div className="form-group">
                <label>Correo Electrónico (Para Login)</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="usuario@taller.com" />
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contraseña</label>
                  <input type="password" required minLength="8" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Mínimo 8 caracteres" />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Rol del Sistema</label>
                  <select required value={formData.rolID} onChange={(e) => setFormData({...formData, rolID: e.target.value})}>
                    <option value="6">Administrador (6)</option>
                    <option value="7">Supervisor (7)</option>
                    <option value="8">Mecánico (8)</option>
                    <option value="9">Recepcionista (9)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading}>
                  {formLoading ? 'REGISTRANDO...' : 'REGISTRAR USUARIO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gestion_Usuarios;