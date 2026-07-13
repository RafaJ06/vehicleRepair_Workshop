import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Edit, Trash2, X, Users, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/Gestion_Clientes.css';

const Gestion_Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ================= ESTADOS DE CONTROLES (Buscador y Paginación) =================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recientes'); // recientes, a-z, z-a
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Cantidad de clientes por página

  // ================= ESTADOS DEL MODAL =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_tipo_identificacion: 1, 
    identificacion: '',
    nombre: '',
    telefono: '',
    direccion: '',
    email: ''
  });

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/');
      throw new Error('Sesión expirada o permisos insuficientes.');
    }
  };

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${URL}/api/clientes`, { headers: getAuthHeaders() });
      handleAuthError(response.status);
      if (!response.ok) throw new Error('Error al obtener los clientes');
      
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setClientes(data.data);
      } else if (Array.isArray(data)) {
        setClientes(data);
      } else {
        setClientes([]);
      }
    } catch (err) {
      setError(err.message);
      setClientes([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) return;
    try {
      const response = await fetch(`${URL}/api/clientes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      handleAuthError(response.status);
      if (!response.ok) throw new Error('Error al eliminar el cliente');
      setClientes(clientes.filter(cliente => cliente.id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // ================= LÓGICA DE PROCESAMIENTO (Búsqueda, Orden y Paginación) =================

  // 1. Filtrar por búsqueda
  let processedClientes = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (cliente.nombre || '').toLowerCase().includes(searchLower) ||
      (cliente.identificacion || '').toLowerCase().includes(searchLower) ||
      (cliente.email || '').toLowerCase().includes(searchLower)
    );
  });

  // 2. Ordenar
  if (sortOption === 'a-z') {
    processedClientes.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  } else if (sortOption === 'z-a') {
    processedClientes.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
  } else {
    // Si tuvieras un ID autoincremental o fecha de creación, se ordenaría aquí.
    // Por defecto lo dejamos como viene de la API.
  }

  // 3. Paginación
  const totalPages = Math.ceil(processedClientes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedClientes.slice(indexOfFirstItem, indexOfLastItem);

  // Reiniciar a la página 1 cuando se busca o se filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption]);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // ================= MANEJO DE MODALES =================
  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData({ id_tipo_identificacion: 1, identificacion: '', nombre: '', telefono: '', direccion: '', email: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      id_tipo_identificacion: cliente.id_tipo_identificacion || 1,
      identificacion: cliente.identificacion || '',
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      email: cliente.email || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const endpoint = editingCliente ? `${URL}/api/clientes/${editingCliente.id}` : `${URL}/api/clientes`;
      const method = editingCliente ? 'PUT' : 'POST';
      const payload = { 
        ...formData, 
        id_tipo_identificacion: formData.id_tipo_identificacion ? Number(formData.id_tipo_identificacion) : null 
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      handleAuthError(response.status);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Error al guardar el cliente');
      }

      closeModal();
      fetchClientes(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminHeader />

      {/* ================= BANNER GIGANTE ================= */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>GESTIÓN DE <span className="text-red">CLIENTES</span></h1>
          <p>ADMINISTRACIÓN DE DIRECTORIO Y CONTACTOS</p>
        </div>
        <div className="hero-slash"></div>
      </div>

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-title-group">
            <Users size={24} color="#ef4444" />
            <h2 className="page-subtitle">DIRECTORIO DEL SISTEMA</h2>
          </div>
          
          <button className="btn-create-primary" onClick={openCreateModal}>
            <Plus size={16} strokeWidth={3} />
            <span>NUEVO CLIENTE</span>
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
              placeholder="Buscar por nombre, cédula o correo..." 
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
              <option value="a-z">Nombre (A - Z)</option>
              <option value="z-a">Nombre (Z - A)</option>
            </select>
          </div>
        </div>

        {/* ================= TABLA DE CLIENTES ================= */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>IDENTIFICACIÓN</th>
                <th>NOMBRE</th>
                <th>TELÉFONO</th>
                <th>CORREO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray">Cargando...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray">No se encontraron clientes.</td></tr>
              ) : (
                currentItems.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="font-bold text-white">{cliente.identificacion || 'N/A'}</td>
                    <td className="font-bold text-white">{cliente.nombre || 'Sin Nombre'}</td>
                    <td>{cliente.telefono || '—'}</td>
                    <td className="text-gray">{cliente.email || '—'}</td>
                    <td>
                      <div className="action-buttons-group">
                        <button className="btn-icon btn-edit" onClick={() => openEditModal(cliente)} title="Editar">
                          <Edit size={18} color="#3b82f6" />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(cliente.id)} title="Eliminar">
                          <Trash2 size={18} color="#ef4444" />
                        </button>
                      </div>
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
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedClientes.length)} de {processedClientes.length}
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

      {/* ================= MODAL DE CREACIÓN/EDICIÓN ================= */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h3>{editingCliente ? 'EDITAR CLIENTE' : 'CREAR CLIENTE'}</h3>
              <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tipo Identif. (ID)</label>
                  <input type="number" min="1" value={formData.id_tipo_identificacion} onChange={(e) => setFormData({...formData, id_tipo_identificacion: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Identificación</label>
                  <input type="text" required value={formData.identificacion} onChange={(e) => setFormData({...formData, identificacion: e.target.value})} placeholder="Ej. 123456789" />
                </div>
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} placeholder="Ej. +1 809-555-0000" />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="cliente@correo.com" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading}>
                  {formLoading ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gestion_Clientes;