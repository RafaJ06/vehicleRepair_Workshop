import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Edit, Trash2, X, CarFront, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/Vehiculos.css';

const Gestion_Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ================= ESTADOS DE CONTROLES (Buscador y Paginación) =================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recientes'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ================= ESTADOS DEL MODAL =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    placa: '',
    chasis: ''
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [resVehiculos, resClientes] = await Promise.all([
        fetch(`${URL}/api/vehiculos`, { headers: getAuthHeaders() }),
        fetch(`${URL}/api/clientes`, { headers: getAuthHeaders() })
      ]);

      handleAuthError(resVehiculos.status);
      handleAuthError(resClientes.status);

      if (!resVehiculos.ok) throw new Error('Error al obtener los vehículos');
      if (!resClientes.ok) throw new Error('Error al obtener los clientes');
      
      const dataVehiculos = await resVehiculos.json();
      const dataClientes = await resClientes.json();

      setVehiculos(Array.isArray(dataVehiculos) ? dataVehiculos : []);
      
      if (dataClientes && Array.isArray(dataClientes.data)) {
        setClientes(dataClientes.data);
      } else if (Array.isArray(dataClientes)) {
        setClientes(dataClientes);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este vehículo?")) return;
    try {
      const response = await fetch(`${URL}/api/vehiculos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      handleAuthError(response.status);
      if (!response.ok) throw new Error('Error al eliminar el vehículo');
      
      setVehiculos(vehiculos.filter(v => v.id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // ================= LÓGICA DE PROCESAMIENTO (Búsqueda, Orden y Paginación) =================

  // 1. Filtrar por búsqueda
  let processedVehiculos = vehiculos.filter(vehiculo => {
    const searchLower = searchTerm.toLowerCase();
    const ownerName = (
      vehiculo.clientes_vehiculos?.nombre || 
      vehiculo.clientes_vehiculos?.clientes?.nombre || 
      (Array.isArray(vehiculo.clientes_vehiculos) && vehiculo.clientes_vehiculos[0]?.clientes?.nombre) || 
      ''
    ).toLowerCase();

    return (
      (vehiculo.placa || '').toLowerCase().includes(searchLower) ||
      (vehiculo.marca || '').toLowerCase().includes(searchLower) ||
      (vehiculo.modelo || '').toLowerCase().includes(searchLower) ||
      ownerName.includes(searchLower)
    );
  });

  // 2. Ordenar
  if (sortOption === 'marca-a-z') {
    processedVehiculos.sort((a, b) => (a.marca || '').localeCompare(b.marca || ''));
  } else if (sortOption === 'marca-z-a') {
    processedVehiculos.sort((a, b) => (b.marca || '').localeCompare(a.marca || ''));
  } else if (sortOption === 'anio-desc') {
    processedVehiculos.sort((a, b) => (b.anio || 0) - (a.anio || 0));
  } else if (sortOption === 'anio-asc') {
    processedVehiculos.sort((a, b) => (a.anio || 0) - (b.anio || 0));
  }

  // 3. Paginación
  const totalPages = Math.ceil(processedVehiculos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedVehiculos.slice(indexOfFirstItem, indexOfLastItem);

  // Reiniciar a la página 1 cuando se busca o se filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption]);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // ================= MANEJO DE MODALES =================
  const openCreateModal = () => {
    setEditingVehiculo(null);
    setFormData({ clienteId: '', marca: '', modelo: '', anio: '', color: '', placa: '', chasis: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (vehiculo) => {
    setEditingVehiculo(vehiculo);
    setFormData({
      clienteId: vehiculo.clienteId || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      anio: vehiculo.anio || '',
      color: vehiculo.color || '',
      placa: vehiculo.placa || '',
      chasis: vehiculo.chasis || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehiculo(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const endpoint = editingVehiculo ? `${URL}/api/vehiculos/${editingVehiculo.id}` : `${URL}/api/vehiculos`;
      const method = editingVehiculo ? 'PUT' : 'POST';
      
      const payload = { 
        ...formData, 
        anio: Number(formData.anio),
        clienteId: Number(formData.clienteId)
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      handleAuthError(response.status);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Error al guardar el vehículo');
      }

      closeModal();
      fetchData(); 
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
          <h1>GESTIÓN DE <span className="text-red">VEHÍCULOS</span></h1>
          <p>ADMINISTRACIÓN DE FLOTAS Y GARAJE DE CLIENTES</p>
        </div>
        <div className="hero-slash"></div>
      </div>

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-title-group">
            <CarFront size={24} color="#ef4444" />
            <h2 className="page-subtitle">FLOTA REGISTRADA</h2>
          </div>
          
          <button className="btn-create-primary" onClick={openCreateModal}>
            <Plus size={16} strokeWidth={3} />
            <span>NUEVO VEHÍCULO</span>
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
              placeholder="Buscar placa, marca, modelo o dueño..." 
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
              <option value="marca-a-z">Marca (A - Z)</option>
              <option value="marca-z-a">Marca (Z - A)</option>
              <option value="anio-desc">Año (Más nuevos)</option>
              <option value="anio-asc">Año (Más viejos)</option>
            </select>
          </div>
        </div>

        {/* ================= TABLA DE VEHÍCULOS ================= */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>PLACA</th>
                <th>VEHÍCULO</th>
                <th>AÑO / COLOR</th>
                <th>PROPIETARIO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray">Cargando base de datos...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray">No se encontraron vehículos.</td></tr>
              ) : (
                currentItems.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <td>
                      <span className="badge-placa">{vehiculo.placa || 'S/N PLACA'}</span>
                    </td>
                    <td>
                      <div className="font-bold text-white">{vehiculo.marca}</div>
                      <div className="text-gray" style={{fontSize: '0.8rem'}}>{vehiculo.modelo}</div>
                    </td>
                    <td>
                      <div className="font-bold text-white">{vehiculo.anio}</div>
                      <div className="text-gray" style={{fontSize: '0.8rem', textTransform: 'capitalize'}}>{vehiculo.color || 'N/E'}</div>
                    </td>
                    <td>
                      <div className="font-bold text-white">
                        { vehiculo.clientes_vehiculos?.nombre || 
                          vehiculo.clientes_vehiculos?.clientes?.nombre || 
                          (Array.isArray(vehiculo.clientes_vehiculos) && vehiculo.clientes_vehiculos[0]?.clientes?.nombre) || 
                          'Desconocido' }
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button className="btn-icon btn-edit" onClick={() => openEditModal(vehiculo)} title="Editar Vehículo">
                          <Edit size={18} color="#3b82f6" />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(vehiculo.id)} title="Eliminar Vehículo">
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
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedVehiculos.length)} de {processedVehiculos.length}
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

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h3>{editingVehiculo ? 'EDITAR VEHÍCULO' : 'REGISTRAR VEHÍCULO'}</h3>
              <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="modal-form">
              
              <div className="form-group">
                <label>Propietario (Cliente)</label>
                <select 
                  required 
                  value={formData.clienteId} 
                  onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                  disabled={!!editingVehiculo} 
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} (ID: {c.identificacion})</option>
                  ))}
                </select>
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Marca</label>
                  <input type="text" required value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} placeholder="Ej. Toyota" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Modelo</label>
                  <input type="text" required value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} placeholder="Ej. Corolla" />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Año</label>
                  <input type="number" required min="1950" max="2030" value={formData.anio} onChange={(e) => setFormData({...formData, anio: e.target.value})} placeholder="Ej. 2020" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Color</label>
                  <input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} placeholder="Ej. Rojo" />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Placa / Matrícula</label>
                  <input type="text" required value={formData.placa} onChange={(e) => setFormData({...formData, placa: e.target.value})} placeholder="Ej. AB-12345" style={{textTransform: 'uppercase'}} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Chasis (VIN)</label>
                  <input type="text" value={formData.chasis} onChange={(e) => setFormData({...formData, chasis: e.target.value})} placeholder="Número de serie" style={{textTransform: 'uppercase'}} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading}>
                  {formLoading ? 'GUARDANDO...' : 'GUARDAR VEHÍCULO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gestion_Vehiculos;