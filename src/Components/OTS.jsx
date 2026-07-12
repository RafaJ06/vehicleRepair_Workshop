import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/OTS.css';

const OTS = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${URL}/api/ordenes-trabajo`, {
        headers: getAuthHeaders()
      });
      
      handleAuthError(response.status);
      if (!response.ok) throw new Error('Error al obtener las órdenes de trabajo');
      
      const data = await response.json();
      setOrdenes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatOtId = (id) => {
    if (!id) return 'OT-???';
    if (String(id).startsWith('OT-')) return id;
    return `OT-${String(id).padStart(3, '0')}`;
  };

  return (
    <div className="ot-container">
      <AdminHeader />

      <main className="ot-main">
        
        <div className="ot-page-header">
          <h1 className="ot-page-title">ÓRDENES DE TRABAJO (OT)</h1>
          <button className="btn-create-ot">
            <Plus size={16} strokeWidth={3} />
            <span>CREAR OT</span>
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="ot-table-wrapper">
          <table className="ot-table">
            <thead>
              <tr>
                <th>ID OT</th>
                <th>VEHÍCULO / CLIENTE</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray">Cargando órdenes de trabajo...</td>
                </tr>
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray">No hay órdenes de trabajo registradas.</td>
                </tr>
              ) : (
                ordenes.map((orden) => (
                  <tr key={orden.id}>
                    
                    <td className="ot-id-cell">
                      {formatOtId(orden.id)}
                    </td>

                    <td>
                      <div className="ot-info-cell">
                        <span className="ot-vehicle">
                          {orden.vehiculo?.placa || 'Sin Placa'}
                        </span>
                        <span className="ot-client">
                          {/* ✅ CORRECCIÓN: Leemos 'usuario' tal como viene del backend */}
                          {orden.usuario?.nombre || orden.cliente?.nombre || 'Cliente Desconocido'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="ot-status-badge">
                        {orden.estado || 'PENDIENTE'}
                      </span>
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

export default OTS;