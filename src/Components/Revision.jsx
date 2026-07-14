import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Edit, Trash2, X, Search, Filter, ChevronLeft, ChevronRight, ClipboardList, Wrench, Activity } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/Revision.css';

const Revision = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [canEdit, setCanEdit] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recientes'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    clienteId: '', marca: '', modelo: '', anio: '', color: '', placa: '', chasis: ''
  });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [diagnosisFormData, setDiagnosisFormData] = useState({
    presionBaja: '', presionAlta: '', temperatura: '', fallaDetectada: '', estatus: 'En Proceso'
  });

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/');
      throw new Error('Sesión expirada.');
    }
  };

  const getOwnerName = (v) => {
    if (!v) return 'Desconocido';
    return v.clientes_vehiculos?.nombre || 
           v.clientes_vehiculos?.clientes?.nombre || 
           (Array.isArray(v.clientes_vehiculos) && v.clientes_vehiculos[0]?.clientes?.nombre) || 
           v.cliente?.nombre || 'Desconocido';
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
      const dataVehiculos = await resVehiculos.json();
      const dataClientes = await resClientes.json();

      setVehiculos(Array.isArray(dataVehiculos) ? dataVehiculos : []);
      if (dataClientes && Array.isArray(dataClientes.data)) setClientes(dataClientes.data);
      else if (Array.isArray(dataClientes)) setClientes(dataClientes);
      
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (window.location.pathname.includes('/admin')) setCanEdit(false);
    else setCanEdit(true);
    fetchData();
    
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este vehículo?")) return;
    try {
      const response = await fetch(`${URL}/api/vehiculos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      handleAuthError(response.status);
      setVehiculos(vehiculos.filter(v => v.id !== id));
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  let processedVehiculos = vehiculos.filter(vehiculo => {
    const searchLower = searchTerm.toLowerCase();
    const ownerName = getOwnerName(vehiculo).toLowerCase();
    return (
      (vehiculo.placa || '').toLowerCase().includes(searchLower) ||
      (vehiculo.marca || '').toLowerCase().includes(searchLower) ||
      (vehiculo.modelo || '').toLowerCase().includes(searchLower) ||
      ownerName.includes(searchLower)
    );
  });

  if (sortOption === 'marca-a-z') processedVehiculos.sort((a, b) => (a.marca || '').localeCompare(b.marca || ''));
  else if (sortOption === 'marca-z-a') processedVehiculos.sort((a, b) => (b.marca || '').localeCompare(a.marca || ''));
  else if (sortOption === 'anio-desc') processedVehiculos.sort((a, b) => (b.anio || 0) - (a.anio || 0));
  else if (sortOption === 'anio-asc') processedVehiculos.sort((a, b) => (a.anio || 0) - (b.anio || 0));

  const totalPages = Math.ceil(processedVehiculos.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedVehiculos.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const openCreateModal = () => {
    setEditingVehiculo(null);
    setFormData({ clienteId: '', marca: '', modelo: '', anio: '', color: '', placa: '', chasis: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (vehiculo) => {
    setEditingVehiculo(vehiculo);
    setFormData({ ...vehiculo });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingVehiculo(null); };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const endpoint = editingVehiculo ? `${URL}/api/vehiculos/${editingVehiculo.id}` : `${URL}/api/vehiculos`;
      const method = editingVehiculo ? 'PUT' : 'POST';
      const payload = { ...formData, anio: Number(formData.anio), clienteId: Number(formData.clienteId) };

      const response = await fetch(endpoint, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
      handleAuthError(response.status);
      
      if (!response.ok) throw new Error('Error al guardar el vehículo');
      const vehicleData = await response.json();

      // CREACIÓN AUTOMÁTICA DEL DIAGNÓSTICO INICIAL AL REGISTRAR
      if (!editingVehiculo) {
        await fetch(`${URL}/api/diagnosticos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            id_vehiculo: vehicleData.id,
            fallaDetectada: 'Vehículo en recepción. Pendiente de revisión técnica inicial.',
            estatus: 'Pendiente'
          })
        });
      }

      closeModal();
      fetchData(); 
    } catch (err) { alert(`Error: ${err.message}`); } 
    finally { setFormLoading(false); }
  };

  // ================= MODAL DE DIAGNÓSTICO (NUEVO REGISTRO) =================
  const openDiagnosisModal = (vehiculo) => {
    setSelectedVehicle(vehiculo);
    // Limpiamos el formulario para asegurar que siempre se cree uno nuevo
    setDiagnosisFormData({
      presionBaja: '', presionAlta: '', temperatura: '', fallaDetectada: '', estatus: 'En Proceso'
    });
    setIsDiagnosisModalOpen(true);
  };

  const closeDiagnosisModal = () => {
    setIsDiagnosisModalOpen(false);
  };

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        id_vehiculo: selectedVehicle.id,
        presionBaja: diagnosisFormData.presionBaja ? Number(diagnosisFormData.presionBaja) : null,
        presionAlta: diagnosisFormData.presionAlta ? Number(diagnosisFormData.presionAlta) : null,
        temperatura: diagnosisFormData.temperatura ? Number(diagnosisFormData.temperatura) : null,
        fallaDetectada: diagnosisFormData.fallaDetectada,
        estatus: diagnosisFormData.estatus
      };

      // 1. Crear el diagnóstico
      const response = await fetch(`${URL}/api/diagnosticos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar el diagnóstico.');
      }

      
      const nuevoDiagnostico = await response.json();

      // 2. LÓGICA AUTOMATIZADA: Si el estatus es "En Proceso", creamos la Orden de Trabajo
      let mensajeExito = 'Nuevo diagnóstico guardado exitosamente.';
      
      if (diagnosisFormData.estatus === 'En Proceso') {
        const otPayload = {
          id_diagnostico: nuevoDiagnostico.id, 
          estatus: 'En Proceso'
        };

        const otResponse = await fetch(`${URL}/api/ordenes-trabajo`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(otPayload)
        });

        if (otResponse.ok) {
          mensajeExito += ' Se ha generado la Orden de Trabajo automáticamente.';
        } else {
          mensajeExito += ' (Nota: Hubo un problema al generar la Orden de Trabajo automática).';
        }
      } else {
        mensajeExito += ' Ahora estará disponible para generar una Orden de Trabajo.';
      }

      alert(mensajeExito);
      closeDiagnosisModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  
  const openHistoryModal = async (vehiculo) => {
    setSelectedVehicle(vehiculo);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
     
      const response = await fetch(`${URL}/api/vehiculos/${vehiculo.id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Error al obtener el historial');
      const data = await response.json();
      
     
      const historial = data.ordenesTrabajo || data.diagnosticos || [];
      setVehicleHistory(Array.isArray(historial) ? historial : []);
    } catch (err) { alert(`Error al cargar detalles: ${err.message}`); } 
    finally { setHistoryLoading(false); }
  };
  
  const closeHistoryModal = () => { setIsHistoryModalOpen(false); setSelectedVehicle(null); };

  return (
    <div className="dashboard-container">
      <AdminHeader />

      <div className="hero-banner">
        <div className="hero-content">
          <h1>REVISIÓN DE <span className="text-red">VEHÍCULOS</span></h1>
          <p>RECEPCIÓN, DIAGNÓSTICO Y FLOTA DE CLIENTES</p>
        </div>
        <div className="hero-slash"></div>
      </div>

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-title-group">
            <Activity size={24} color="#ef4444" />
            <h2 className="page-subtitle">VEHÍCULOS EN RECEPCIÓN</h2>
          </div>
          
          {canEdit && (
            <button className="btn-create-primary" onClick={openCreateModal}>
              <Plus size={16} strokeWidth={3} />
              <span>REGISTRAR VEHÍCULO</span>
            </button>
          )}
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
            <input type="text" className="search-input" placeholder="Buscar placa, marca, modelo o dueño..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-wrapper">
            <Filter className="filter-icon" size={18} />
            <select className="filter-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="recientes">Más Recientes</option>
              <option value="marca-a-z">Marca (A - Z)</option>
              <option value="marca-z-a">Marca (Z - A)</option>
              <option value="anio-desc">Año (Más nuevos)</option>
              <option value="anio-asc">Año (Más viejos)</option>
            </select>
          </div>
        </div>

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
                    <td><span className="badge-placa">{vehiculo.placa || 'S/N'}</span></td>
                    <td>
                      <div className="font-bold text-white">{vehiculo.marca}</div>
                      <div className="text-gray" style={{fontSize: '0.8rem'}}>{vehiculo.modelo}</div>
                    </td>
                    <td>
                      <div className="font-bold text-white">{vehiculo.anio}</div>
                      <div className="text-gray" style={{fontSize: '0.8rem', textTransform: 'capitalize'}}>{vehiculo.color || 'N/E'}</div>
                    </td>
                    <td><div className="font-bold text-white">{getOwnerName(vehiculo)}</div></td>
                    <td>
                      <div className="action-buttons-group">
                        {canEdit && (
                          <button className="btn-icon btn-diagnose" onClick={() => openDiagnosisModal(vehiculo)} title="Nuevo Diagnóstico">
                            <Wrench size={18} color="#a855f7" />
                          </button>
                        )}
                        <button className="btn-icon btn-history" onClick={() => openHistoryModal(vehiculo)} title="Ver Historial">
                          <ClipboardList size={18} color="#10b981" />
                        </button>
                        {canEdit && (
                          <>
                            <button className="btn-icon btn-edit" onClick={() => openEditModal(vehiculo)} title="Editar Vehículo">
                              <Edit size={18} color="#3b82f6" />
                            </button>
                            <button className="btn-icon btn-delete" onClick={() => handleDelete(vehiculo.id)} title="Eliminar Vehículo">
                              <Trash2 size={18} color="#ef4444" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedVehiculos.length)} de {processedVehiculos.length}</span>
            <div className="pagination-controls">
              <button className="btn-page" onClick={prevPage} disabled={currentPage === 1}><ChevronLeft size={18} /></button>
              <span className="page-indicator">Página {currentPage} de {totalPages}</span>
              <button className="btn-page" onClick={nextPage} disabled={currentPage === totalPages}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </main>

      
      {isDiagnosisModalOpen && selectedVehicle && (
        <div className="custom-modal-overlay">
          <div className="custom-modal" style={{maxWidth: '650px'}}>
            <div className="modal-header">
              <div>
                <h3 style={{color: '#a855f7'}}>CREAR NUEVO DIAGNÓSTICO</h3>
                <p style={{margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af', letterSpacing: '0.05em'}}>
                  <span className="text-white font-bold">{selectedVehicle.placa}</span> | {selectedVehicle.marca} {selectedVehicle.modelo}
                </p>
              </div>
              <button className="close-modal-btn" onClick={closeDiagnosisModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleDiagnosisSubmit} className="modal-form">
              
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label>Estatus del Diagnóstico</label>
                <select 
                  value={diagnosisFormData.estatus} 
                  onChange={(e) => setDiagnosisFormData({...diagnosisFormData, estatus: e.target.value})}
                  style={{ border: '1px solid #a855f7', backgroundColor: 'rgba(168, 85, 247, 0.05)' }}
                >
                  <option value="Pendiente" style={{ backgroundColor: '#0a0d14' }}>PENDIENTE</option>
                  <option value="En Proceso" style={{ backgroundColor: '#0a0d14' }}>EN PROCESO</option>
                  <option value="Realizado" style={{ backgroundColor: '#0a0d14' }}>REALIZADO</option>
                </select>
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Presión Baja (PSI)</label>
                  <input type="number" step="0.01" value={diagnosisFormData.presionBaja} onChange={(e) => setDiagnosisFormData({...diagnosisFormData, presionBaja: e.target.value})} placeholder="Ej. 30.5" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Presión Alta (PSI)</label>
                  <input type="number" step="0.01" value={diagnosisFormData.presionAlta} onChange={(e) => setDiagnosisFormData({...diagnosisFormData, presionAlta: e.target.value})} placeholder="Ej. 200.0" />
                </div>
              </div>

              <div className="form-group">
                <label>Temperatura (°C / °F)</label>
                <input type="number" step="0.01" value={diagnosisFormData.temperatura} onChange={(e) => setDiagnosisFormData({...diagnosisFormData, temperatura: e.target.value})} placeholder="Temperatura de operación" />
              </div>

              <div className="form-group">
                <label>Falla Detectada / Notas del Mecánico</label>
                <textarea 
                  required rows="4" value={diagnosisFormData.fallaDetectada} 
                  onChange={(e) => setDiagnosisFormData({...diagnosisFormData, fallaDetectada: e.target.value})} 
                  placeholder="Describe detalladamente los síntomas, ruidos, códigos de escáner o revisiones visuales encontradas..." 
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111622', border: '1px solid #374151', color: '#ffffff', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeDiagnosisModal}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading} style={{backgroundColor: '#a855f7'}}>
                  {formLoading ? 'GUARDANDO...' : 'CREAR DIAGNÓSTICO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
      {isModalOpen && canEdit && (
         <div className="custom-modal-overlay">
         <div className="custom-modal">
           <div className="modal-header">
             <h3>{editingVehiculo ? 'EDITAR VEHÍCULO' : 'REGISTRAR VEHÍCULO'}</h3>
             <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
           </div>
           
           <form onSubmit={handleModalSubmit} className="modal-form">
             <div className="form-group">
               <label>Propietario (Cliente)</label>
               <select required value={formData.clienteId} onChange={(e) => setFormData({...formData, clienteId: e.target.value})} disabled={!!editingVehiculo}>
                 <option value="" style={{ backgroundColor: '#0a0d14' }}>-- Selecciona un cliente --</option>
                 {clientes.map(c => <option key={c.id} value={c.id} style={{ backgroundColor: '#0a0d14' }}>{c.nombre} (ID: {c.identificacion})</option>)}
               </select>
             </div>
             <div className="form-group-row">
               <div className="form-group" style={{ flex: 1 }}><label>Marca</label><input type="text" required value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} /></div>
               <div className="form-group" style={{ flex: 1 }}><label>Modelo</label><input type="text" required value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} /></div>
             </div>
             <div className="form-group-row">
               <div className="form-group" style={{ flex: 1 }}><label>Año</label><input type="number" required value={formData.anio} onChange={(e) => setFormData({...formData, anio: e.target.value})} /></div>
               <div className="form-group" style={{ flex: 1 }}><label>Color</label><input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} /></div>
             </div>
             <div className="form-group-row">
               <div className="form-group" style={{ flex: 1 }}><label>Placa / Matrícula</label><input type="text" required value={formData.placa} onChange={(e) => setFormData({...formData, placa: e.target.value})} style={{textTransform: 'uppercase'}} /></div>
               <div className="form-group" style={{ flex: 1 }}><label>Chasis (VIN)</label><input type="text" value={formData.chasis} onChange={(e) => setFormData({...formData, chasis: e.target.value})} style={{textTransform: 'uppercase'}} /></div>
             </div>
             <div className="modal-actions">
               <button type="button" className="btn-cancel" onClick={closeModal}>CANCELAR</button>
               <button type="submit" className="btn-confirm" disabled={formLoading}>{formLoading ? 'GUARDANDO...' : 'GUARDAR VEHÍCULO'}</button>
             </div>
           </form>
         </div>
       </div>
      )}

      {isHistoryModalOpen && selectedVehicle && (
        <div className="custom-modal-overlay">
          <div className="custom-modal history-modal">
            <div className="modal-header history-header">
              <div>
                <h3>HISTORIAL GENERAL</h3>
                <p className="history-subtitle"><span className="text-red font-bold">{selectedVehicle.placa}</span> | {selectedVehicle.marca}</p>
              </div>
              <button className="close-modal-btn" onClick={closeHistoryModal}><X size={20} /></button>
            </div>
            <div className="history-scroll-area">
              {historyLoading ? (
                <div className="text-center py-4 text-gray">Cargando...</div>
              ) : vehicleHistory.length === 0 ? (
                <div className="text-center py-4 text-gray">No hay registros asociados a este vehículo.</div>
              ) : (
                vehicleHistory.map((item, index) => (
                  <div key={item.id || index} style={{padding: '1rem', border: '1px solid #374151', borderRadius: '4px', marginBottom: '1rem'}}>
                    <div style={{fontWeight: 'bold', color: '#ffffff'}}>{item.estatus || 'Completado'}</div>
                    <div style={{color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.5rem'}}>
                      {item.fallaDetectada || item.descripcion || 'Registro sin detalles'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revision;