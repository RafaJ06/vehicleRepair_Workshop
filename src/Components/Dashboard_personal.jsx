import React, { useState, useEffect } from 'react';
import { Activity, Car, AlertCircle } from 'lucide-react';
import {url} from '../App.jsx'
import '../Style/Dashboard_Personal.css';

const Dashboard_Personal = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/api/ordenes-trabajo`);
        if (!response.ok) throw new Error('Error al cargar las órdenes de trabajo');
        
        const data = await response.json();
        const ordenesActivas = data.filter(ot => !['CERRADA', 'CANCELADA'].includes(ot.estado));
        setOrdenes(ordenesActivas);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
  }, []);

  const getStatusType = (estado) => {
    switch(estado) {
      case 'EN_REPARACION': return 'warning'; 
      case 'LISTO': return 'success'; 
      case 'ABIERTA': 
      case 'EN_DIAGNOSTICO': return 'default'; 
      default: return 'default';
    }
  };

  const formatEstado = (estado) => estado?.replace('_', ' ');

  const listosParaRevisar = ordenes.filter(ot => ot.estado === 'ABIERTA').length;
  const urgentes = ordenes.filter(ot => ot.estado === 'EN_REPARACION').length; 

  return (
    <div className="operative-container">
      
      <section className="op-hero">
        <div className="op-hero-content">
          <h1 className="op-hero-title">
            <span className="text-white">PANEL</span> <span className="text-red">OPERATIVO</span>
          </h1>
          <p className="op-hero-subtitle">GESTIÓN TÉCNICA Y DE TALLER</p>
        </div>
      </section>

      <main className="op-main-content">
        
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
                <span className="summary-label">MIS OTS ASIGNADAS</span>
                <Activity size={16} className="summary-icon" />
              </div>
              <div className="summary-body">
                <span className="summary-value">{loading ? '-' : ordenes.length}</span>
                <span className="summary-subtext text-warning">{urgentes} EN REPARACIÓN</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header">
                <span className="summary-label">VEHÍCULOS EN PATIO</span>
                <Car size={16} className="summary-icon" />
              </div>
              <div className="summary-body">
                <span className="summary-value">{loading ? '-' : ordenes.length}</span>
                <span className="summary-subtext text-success">{listosParaRevisar} LISTOS PARA REVISAR</span>
              </div>
            </div>
          </div>
        </section>

        <section className="op-section">
          <div className="op-section-header">
            <h2 className="op-section-title">TRABAJOS PARA HOY</h2>
          </div>
          
          <div className="op-table-wrapper">
            <table className="op-table">
              <thead>
                <tr>
                  <th>ID OT</th>
                  <th>VEHÍCULO</th>
                  <th>TAREA ASIGNADA</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      Cargando trabajos...
                    </td>
                  </tr>
                ) : ordenes.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No hay órdenes de trabajo activas para hoy.
                    </td>
                  </tr>
                ) : (
                  ordenes.map((ot) => (
                    <tr key={ot.id}>
                      <td className="cell-id">
                        
                        OT-{String(ot.id).padStart(3, '0')}
                      </td>
                      <td className="cell-vehicle">
                        {ot.vehiculo?.placa || 'Sin placa'}
                      </td>
                      <td className="cell-task">
                        {ot.problemaReportado || 'Diagnóstico general'}
                      </td>
                      <td className="cell-status">
                        <span className={`op-badge badge-${getStatusType(ot.estado)}`}>
                          {formatEstado(ot.estado)}
                        </span>
                      </td>
                    </tr>
                  ))
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