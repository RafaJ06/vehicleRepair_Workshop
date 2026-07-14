import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Wrench, Eye, CheckCircle, X, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/OTS.css';

const OTS = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [esMecanico, setEsMecanico] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOT, setSelectedOT] = useState(null);
  
  const [newStatus, setNewStatus] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const handleAuthError = (status) => {
    if (status === 401) {
      localStorage.clear();
      navigate('/');
      throw new Error('Sesión expirada.');
    }
    if (status === 403) {
      throw new Error('ACCESO DENEGADO: Tu rol no tiene permisos para esta acción.');
    }
  };

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userStr = localStorage.getItem('usuario');
      if (!userStr) { navigate('/'); return; }
      
      const user = JSON.parse(userStr);
      setUsuarioActivo(user);
      
      const isMech = user.rolId === 8 || (user.rol?.nombre || '').toLowerCase().includes('mecanic');
      setEsMecanico(isMech);

      const endpoint = isMech 
        ? `${URL}/api/ordenes-trabajo?mecanicoId=${user.id}` 
        : `${URL}/api/ordenes-trabajo`;

      const response = await fetch(endpoint, { headers: getAuthHeaders() });
      handleAuthError(response.status);
      
      if (!response.ok) throw new Error('Error al obtener las órdenes de trabajo');
      
      const respuestaAPI = await response.json();
      
      setOrdenes(Array.isArray(respuestaAPI.data) ? respuestaAPI.data : []);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    
  }, []);

  let processedOrdenes = ordenes.filter(ot => {
    const searchLower = searchTerm.toLowerCase();
    const vehiculo = ot.diagnosticos?.vehiculos;
    const placa = vehiculo?.placa?.toLowerCase() || '';
    const falla = ot.diagnosticos?.fallaDetectada?.toLowerCase() || '';
    
    const matchesSearch = placa.includes(searchLower) || falla.includes(searchLower) || `ot-${ot.id}`.includes(searchLower);
    
    // Comparación estricta ignorando mayúsculas/minúsculas
    const matchesStatus = statusFilter === 'Todas' || (ot.estatus || '').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(processedOrdenes.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedOrdenes.slice(indexOfFirstItem, indexOfLastItem);

  const getBadgeClass = (estatus) => {
    const s = (estatus || '').toUpperCase();
    if (s.includes('REPARACIÓN')) return 'warning';
    if (s.includes('DIAGNÓSTICO') || s.includes('PROCESO') || s.includes('REPUESTOS')) return 'danger';
    if (s.includes('FINALIZADA') || s.includes('CERRADA')) return 'success';
    return 'default';
  };

  const openDetailsModal = (ot) => {
    setSelectedOT(ot);
    setIsDetailsModalOpen(true);
  };

  const openStatusModal = (ot) => {
    setSelectedOT(ot);
    // 💡 IMPORTANTE: Si es nueva, se asume 'En Proceso' (como dice tu backend)
    setNewStatus(ot.estatus || 'En Proceso'); 
    setIsStatusModalOpen(true);
  };

  const closeModals = () => {
    setIsDetailsModalOpen(false);
    setIsStatusModalOpen(false);
    setSelectedOT(null);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch(`${URL}/api/ordenes-trabajo/${selectedOT.id}/estatus`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estatus: newStatus })
      });
      
      handleAuthError(response.status);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Error al actualizar la orden.');
      }

      closeModals();
      fetchOrdenes(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminHeader />

      <div className="hero-banner">
        <div className="hero-content">
          <h1>ÓRDENES DE <span className="text-red">TRABAJO</span></h1>
          <p>{esMecanico ? 'TU BANDEJA DE TRABAJOS ASIGNADOS' : 'GESTIÓN Y MONITOREO DE REPARACIONES'}</p>
        </div>
        <div className="hero-slash"></div>
      </div>

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-title-group">
            <Wrench size={24} color="#ef4444" />
            <h2 className="page-subtitle">TABLERO DE TAREAS</h2>
          </div>
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
              placeholder="Buscar por placa, diagnóstico o ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <Filter className="filter-icon" size={18} />
            
           
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="Todas" style={{ backgroundColor: '#0a0d14' }}>Todos los Estatus</option>
              <option value="En Proceso" style={{ backgroundColor: '#0a0d14' }}>En Proceso (Nuevas)</option>
              <option value="En Diagnóstico" style={{ backgroundColor: '#0a0d14' }}>En Diagnóstico</option>
              <option value="En Reparación" style={{ backgroundColor: '#0a0d14' }}>En Reparación</option>
              <option value="Esperando Repuestos" style={{ backgroundColor: '#0a0d14' }}>Esperando Repuestos</option>
              <option value="Finalizada" style={{ backgroundColor: '#0a0d14' }}>Finalizada (Lista)</option>
              
              {!esMecanico && (
                <>
                  <option value="Cerrada" style={{ backgroundColor: '#0a0d14' }}>Cerrada (Facturada)</option>
                  <option value="Cancelada" style={{ backgroundColor: '#0a0d14' }}>Cancelada</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>OT #</th>
                <th>VEHÍCULO</th>
                <th>DIAGNÓSTICO ASOCIADO</th>
                {!esMecanico && <th>MECÁNICO</th>}
                <th>ESTATUS</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={esMecanico ? "5" : "6"} className="text-center py-4 text-gray">Cargando órdenes de trabajo...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={esMecanico ? "5" : "6"} className="text-center py-4 text-gray">No tienes órdenes de trabajo asignadas o que coincidan con la búsqueda.</td></tr>
              ) : (
                currentItems.map((ot) => {
                  const vehiculo = ot.diagnosticos?.vehiculos;
                  const diagnosticoText = ot.diagnosticos?.fallaDetectada || 'Sin detalles registrados';
                  
                  return (
                    <tr key={ot.id}>
                      <td className="font-bold text-white">OT-{String(ot.id).padStart(4, '0')}</td>
                      <td>
                        <div className="font-bold" style={{color: '#3b82f6'}}>{vehiculo?.placa || 'S/N'}</div>
                        <div className="text-gray" style={{fontSize: '0.8rem'}}>{vehiculo?.marca} {vehiculo?.modelo}</div>
                      </td>
                      <td>
                        <div className="text-gray" style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {diagnosticoText}
                        </div>
                      </td>
                      {!esMecanico && <td><span className="text-gray">{ot.mecanico?.nombre || 'No asignado'}</span></td>}
                      <td>
                        <span className={`ot-badge badge-${getBadgeClass(ot.estatus)}`}>
                          {ot.estatus ? ot.estatus.toUpperCase() : 'DESCONOCIDO'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          
                          <button className="btn-icon btn-view" onClick={() => openDetailsModal(ot)} title="Ver detalles del trabajo">
                            <Eye size={18} color="#3b82f6" />
                          </button>

                          {ot.estatus !== 'Cerrada' && ot.estatus !== 'Cancelada' && (
                            <button className="btn-icon btn-status" onClick={() => openStatusModal(ot)} title="Actualizar progreso">
                              <CheckCircle size={18} color="#10b981" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedOrdenes.length)} de {processedOrdenes.length}</span>
            <div className="pagination-controls">
              <button className="btn-page" onClick={prevPage} disabled={currentPage === 1}><ChevronLeft size={18} /></button>
              <span className="page-indicator">Página {currentPage} de {totalPages}</span>
              <button className="btn-page" onClick={nextPage} disabled={currentPage === totalPages}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </main>

      {isDetailsModalOpen && selectedOT && (
        <div className="custom-modal-overlay">
          <div className="custom-modal" style={{maxWidth: '650px'}}>
            <div className="modal-header">
              <div>
                <h3 style={{color: '#3b82f6'}}>DETALLES DE TRABAJO | OT-{String(selectedOT.id).padStart(4, '0')}</h3>
                <p style={{margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af', letterSpacing: '0.05em'}}>
                  VEHÍCULO: <span className="text-white font-bold">{selectedOT.diagnosticos?.vehiculos?.placa}</span> | {selectedOT.diagnosticos?.vehiculos?.marca} {selectedOT.diagnosticos?.vehiculos?.modelo}
                </p>
              </div>
              <button className="close-modal-btn" onClick={closeModals}><X size={20} /></button>
            </div>
            
            <div className="ot-details-content">
               <div className="info-block mb-1">
                 <span className="info-label text-red">ESTATUS ACTUAL</span>
                 <p className="info-text font-bold" style={{fontSize: '1rem'}}>{selectedOT.estatus ? selectedOT.estatus.toUpperCase() : 'EN PROCESO'}</p>
               </div>
               
               <div className="info-grid">
                  <div className="info-block">
                    <span className="info-label">PRESIÓN BAJA (PSI)</span>
                    <p className="info-text">{selectedOT.diagnosticos?.presionBaja || 'N/A'}</p>
                  </div>
                  <div className="info-block">
                    <span className="info-label">PRESIÓN ALTA (PSI)</span>
                    <p className="info-text">{selectedOT.diagnosticos?.presionAlta || 'N/A'}</p>
                  </div>
                  <div className="info-block">
                    <span className="info-label">TEMPERATURA</span>
                    <p className="info-text">{selectedOT.diagnosticos?.temperatura || 'N/A'}</p>
                  </div>
               </div>

               <div className="info-block mt-2" style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '4px', border: '1px solid #1f2937' }}>
                 <span className="info-label" style={{color: '#a855f7'}}>DIAGNÓSTICO ORIGINAL / TRABAJO A REALIZAR</span>
                 <p className="info-text mt-1">{selectedOT.diagnosticos?.fallaDetectada || 'Sin detalles especificados.'}</p>
               </div>
            </div>

            <div className="modal-actions" style={{marginTop: '1.5rem'}}>
              <button className="btn-cancel" onClick={closeModals}>CERRAR PANTALLA</button>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && selectedOT && (
        <div className="custom-modal-overlay">
          <div className="custom-modal" style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <div>
                <h3 style={{color: '#10b981'}}>ACTUALIZAR PROGRESO</h3>
                <p style={{margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af', letterSpacing: '0.05em'}}>
                  OT-{String(selectedOT.id).padStart(4, '0')}
                </p>
              </div>
              <button className="close-modal-btn" onClick={closeModals}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleStatusSubmit} className="modal-form">
              <div className="form-group">
                <label>Selecciona el nuevo estado del vehículo:</label>
                
                
                <select 
                  required 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ border: '1px solid #10b981', fontSize: '1rem', padding: '1rem', backgroundColor: '#111622', color: '#ffffff' }}
                >
                  <option value="En Proceso" style={{ backgroundColor: '#0a0d14' }}>En Proceso (Recién Creada)</option>
                  <option value="En Diagnóstico" style={{ backgroundColor: '#0a0d14' }}>En Diagnóstico</option>
                  <option value="En Reparación" style={{ backgroundColor: '#0a0d14' }}>En Reparación (Trabajando)</option>
                  <option value="Esperando Repuestos" style={{ backgroundColor: '#0a0d14' }}>Esperando Repuestos</option>
                  <option value="Finalizada" style={{ backgroundColor: '#0a0d14' }}>Finalizada (Auto Listo para Entregar)</option>
                  
                  {!esMecanico && (
                    <>
                     
                      <option value="Cerrada" style={{ backgroundColor: '#0a0d14' }}>Cerrada (Requiere Factura Pagada)</option>
                      <option value="Cancelada" style={{ backgroundColor: '#0a0d14' }}>Cancelada</option>
                    </>
                  )}
                </select>
                
                <p style={{color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem', lineHeight: '1.4'}}>
                  <strong>Nota:</strong> Como mecánico debes marcar el trabajo como <span className="text-white">"Finalizada"</span> cuando hayas terminado de arreglar el vehículo. La administración se encargará de facturarla y "Cerrarla".
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModals}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading} style={{backgroundColor: '#10b981'}}>
                  {formLoading ? 'GUARDANDO...' : 'CONFIRMAR ESTADO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTS;