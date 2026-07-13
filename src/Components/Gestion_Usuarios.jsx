import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, UserCog, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/Gestion_Usuarios.css';

const Gestion_Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ================= ESTADOS DE CONTROLES (Buscador y Paginación) =================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recientes'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/api/usuarios`, { headers: getAuthHeaders() });
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
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ================= LÓGICA DE PROCESAMIENTO (Búsqueda, Orden y Paginación) =================

  // 1. Filtrar por búsqueda
  let processedUsuarios = usuarios.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.nombre || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.rol?.nombre || '').toLowerCase().includes(searchLower) ||
      (user.sucursal?.nombre || '').toLowerCase().includes(searchLower)
    );
  });

  // 2. Ordenar
  if (sortOption === 'nombre-a-z') {
    processedUsuarios.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  } else if (sortOption === 'nombre-z-a') {
    processedUsuarios.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
  } else if (sortOption === 'activos') {
    processedUsuarios.sort((a, b) => (b.estado === true ? 1 : 0) - (a.estado === true ? 1 : 0));
  } else if (sortOption === 'inactivos') {
    processedUsuarios.sort((a, b) => (a.estado === true ? 1 : 0) - (b.estado === true ? 1 : 0));
  }

  // 3. Paginación
  const totalPages = Math.ceil(processedUsuarios.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedUsuarios.slice(indexOfFirstItem, indexOfLastItem);

  // Reiniciar a la página 1 cuando se busca o se filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption]);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


  return (
    <div className="dashboard-container">
      <AdminHeader />

      {/* ================= BANNER GIGANTE ================= */}
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
          
          <button className="btn-create-primary" onClick={() => alert("Abrir modal de crear usuario")}>
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

        {/* ================= BARRA DE CONTROLES (Buscador y Filtro) ================= */}
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

        {/* ================= TABLA DE USUARIOS ================= */}
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

        {/* ================= PAGINACIÓN ================= */}
        {!loading && totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedUsuarios.length)} de {processedUsuarios.length}
            </span>
            <div className="pagination-controls">
              <button className="btn-page" onClick={prevPage} disabled={currentPage === 1}>
                <ChevronLeft size={18} />
              </button>
              <span className="page-indicator">Página {currentPage} de {totalPages}</span>
              <button className="btn-page" onClick={nextPage} disabled={currentPage === totalPages}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Gestion_Usuarios;