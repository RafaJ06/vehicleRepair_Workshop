import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Car, AlertCircle } from 'lucide-react';
import '../Style/Dashboard_Personal.css';
import { URL } from '../App';
import { AdminHeader } from './Header'; 

const Dashboard_Personal = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
      navigate('/');
      return;
    }

    const fetchOrdenes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${URL}/api/ordenes-trabajo`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (!response.ok) throw new Error('Error al cargar las órdenes de trabajo');
        
        const respuestaAPI = await response.json();
        
        const listaOrdenes = Array.isArray(respuestaAPI.data) ? respuestaAPI.data : [];

        const ordenesActivas = listaOrdenes.filter(ot => {
          const statusStr = (ot.estatus || '').toUpperCase();
          return !['CERRADA', 'CANCELADA', 'FINALIZADA'].includes(statusStr);
        });

        setOrdenes(ordenesActivas);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
  }, [navigate]);

  const getStatusType = (estatus) => {
    const s = (estatus || '').toUpperCase();
    if (s.includes('REPARACIÓN')) return 'warning'; 
    if (s.includes('DIAGNÓSTICO') || s.includes('PROCESO')) return 'primary';
    if (s.includes('ESPERANDO')) return 'danger';
    return 'default';
  };

  const listosParaRevisar = ordenes.filter(ot => (ot.estatus || '').toUpperCase().includes('DIAGNÓSTICO')).length;
  const urgentes = ordenes.filter(ot => (ot.estatus || '').toUpperCase().includes('REPARACIÓN')).length; 

  return (
    <div className="operative-container" style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', flexDirection: 'column' }}>
      
      <AdminHeader />
      
      <section className="op-hero">
        <div className="op-hero-content">
          <h1 className="op-hero-title">
            <span className="text-white">PANEL</span> <span className="text-red">OPERATIVO</span>
          </h1>
          <p className="op-hero-subtitle">GESTIÓN TÉCNICA Y DE TALLER</p>
        </div>
      </section>

      <main className="op-main-content" style={{ flexGrow: 1 }}>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #7f1d1d', color: '#ef4444', padding: '1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="op-section">
          <div className="op-section-header">
            <h2 className="op-section-title">RESUMEN DE TURNO</h2>
          </div>
          
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-header">
                <span className="summary-label">OTS EN CURSO</span>
                <Activity size={16} className="summary-icon" />
              </div>
              <div className="summary-body">
                <span className="summary-value">{loading ? '-' : ordenes.length}</span>
                <span className="summary-subtext text-warning">{urgentes} EN REPARACIÓN</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header">
                <span className="summary-label">PRIORIDAD DIAGNÓSTICO</span>
                <Car size={16} className="summary-icon" />
              </div>
              <div className="summary-body">
                <span className="summary-value">{loading ? '-' : listosParaRevisar}</span>
                <span className="summary-subtext text-success">VEHÍCULOS EN DIAGNÓSTICO</span>
              </div>
            </div>
          </div>
        </section>

        <section className="op-section">
          <div className="op-section-header">
            <h2 className="op-section-title">TRABAJOS ACTIVOS</h2>
          </div>
          
          <div className="op-table-wrapper">
            <table className="op-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>ID OT</th>
                  <th>VEHÍCULO</th>
                  <th>DIAGNÓSTICO / DETALLE</th>
                  <th>MECÁNICO ASIGNADO</th>
                  <th>ESTATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      Cargando trabajos...
                    </td>
                  </tr>
                ) : ordenes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No hay órdenes de trabajo activas por el momento.
                    </td>
                  </tr>
                ) : (
                  ordenes.map((ot) => {
                    // Extraemos los detalles del vehículo y del diagnóstico
                    const vehiculo = ot.diagnosticos?.vehiculos;
                    const vehiculoPlaca = vehiculo?.placa || 'S/N Placa';
                    const vehiculoInfo = vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Detalles no disponibles';
                    const falla = ot.diagnosticos?.fallaDetectada || 'Sin diagnóstico registrado';
                    const mecanicoAsignado = ot.mecanico?.nombre || 'Sin asignar';

                    return (
                      <tr key={ot.id}>
                        <td className="cell-id">
                          OT-{String(ot.id).padStart(4, '0')}
                        </td>
                        <td className="cell-vehicle">
                          <div className="font-bold text-white">{vehiculoPlaca}</div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{vehiculoInfo}</div>
                        </td>
                        <td className="cell-task text-gray">
                          <div style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={falla}>
                            {falla}
                          </div>
                        </td>
                        <td className="cell-task text-gray">
                          {mecanicoAsignado}
                        </td>
                        <td className="cell-status">
                          <span className={`op-badge badge-${getStatusType(ot.estatus)}`}>
                            {ot.estatus ? ot.estatus.toUpperCase() : 'DESCONOCIDO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard_Personal;