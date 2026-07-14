import React, { useState, useEffect } from 'react';
import { AdminHeader } from './Header'; 
import { URL } from '../App';
import { 
  Wrench, 
  Car, 
  AlertCircle, 
  Users, 
  BarChart2, 
  TrendingUp, 
  Shield, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import '../Style/Dashboard_Admin.css';

const Dashboard_Admin = () => {
 
  const [dashboardData, setDashboardData] = useState({
    ordenesActivas: 0,
    enTaller: 0,
    listosEntrega: 0,
    alertasStock: 0,
    totalClientes: 0,
    facturacionTotal: 0,
    ticketPromedio: 0,
    usuariosActivos: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados para gestionar la lista paginada de usuarios
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; 

  // Estado para la tabla de monitoreo de órdenes
  const [ordenesRecientes, setOrdenesRecientes] = useState([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', { 
      style: 'currency', 
      currency: 'DOP',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };
  };

  // Efecto que carga los datos generales del dashboard. 
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = { headers: getAuthHeaders() };

        const resOrdenes = await fetch(`${URL}/api/reportes/ordenes-por-estado`, config);
        const ordenesPorEstado = await resOrdenes.json();
        const ordenesArray = Array.isArray(ordenesPorEstado) ? ordenesPorEstado : [];
        
        const activas = ordenesArray
          .filter(o => !['CERRADA', 'CANCELADA'].includes(o.estado))
          .reduce((acc, o) => acc + (o.total || 0), 0);
          
        const enTaller = ordenesArray
          .filter(o => ['EN_DIAGNOSTICO', 'EN_REPARACION'].includes(o.estado))
          .reduce((acc, o) => acc + (o.total || 0), 0);

        const listos = ordenesArray
          .find(o => o.estado === 'LISTO' || o.estado === 'LISTO_PARA_ENTREGA')?.total || 0;

        const resStock = await fetch(`${URL}/api/reportes/inventario-bajo-stock`, config);
        const stockData = await resStock.json();
        const alertasStock = Array.isArray(stockData) ? stockData.length : 0;

        const resClientes = await fetch(`${URL}/api/clientes?limit=1`, config);
        const clientesData = await resClientes.json();
        const totalClientes = clientesData.total || 0;

        const resFinanzas = await fetch(`${URL}/api/reportes/facturacion`, config);
        const finanzasData = await resFinanzas.json();
        const facturacionTotal = finanzasData.totalFacturado || 0;
        const ticketPromedio = finanzasData.cantidadFacturas > 0 
          ? facturacionTotal / finanzasData.cantidadFacturas 
          : 0;

        const resUsuarios = await fetch(`${URL}/api/usuarios`, config);
        const usuariosData = await resUsuarios.json();
        const usuariosActivos = Array.isArray(usuariosData) 
          ? usuariosData.filter(u => u.activo || u.estado).length 
          : 0;

        setDashboardData({
          ordenesActivas: activas,
          enTaller,
          listosEntrega: listos,
          alertasStock,
          totalClientes,
          facturacionTotal,
          ticketPromedio,
          usuariosActivos
        });

      } catch (error) {
        console.error("Error al cargar la información del dashboard:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchDashboardData();
  }, []);

  // Efecto que carga los usuarios paginados
  useEffect(() => {
    const fetchPaginatedData = async () => {
      try {
        setLoadingLista(true);
        const res = await fetch(`${URL}/api/usuarios?page=${page}&limit=${limit}`, { 
          headers: getAuthHeaders() 
        });
        const data = await res.json();

        if (data.data && data.totalPages !== undefined) {
          setUsuariosLista(data.data);
          setTotalPages(data.totalPages);
        } else if (Array.isArray(data)) {
          const startIndex = (page - 1) * limit;
          const paginatedItems = data.slice(startIndex, startIndex + limit);
          setUsuariosLista(paginatedItems);
          setTotalPages(Math.ceil(data.length / limit));
        }
      } catch (error) {
        console.error("Error al cargar la lista paginada:", error);
      } finally {
        setLoadingLista(false);
      }
    };

    fetchPaginatedData();
  }, [page]); 

  // Efecto que carga las órdenes para la tabla detallada inferior
  useEffect(() => {
    const fetchOrdenesRecientes = async () => {
      try {
        setLoadingOrdenes(true);
        const res = await fetch(`${URL}/api/ordenes-trabajo?limit=10`, { headers: getAuthHeaders() });
        const data = await res.json();
        const lista = Array.isArray(data.data) ? data.data : [];
        
        // Filtramos para ver solo las que están en curso
        setOrdenesRecientes(lista.filter(ot => !['CERRADA', 'CANCELADA'].includes((ot.estatus || '').toUpperCase())));
      } catch (error) {
        console.error("Error al cargar órdenes recientes:", error);
      } finally {
        setLoadingOrdenes(false);
      }
    };

    fetchOrdenesRecientes();
  }, []);

  return (
    <div className="admin-container">
      
      <AdminHeader />
      
      <section className="admin-hero">
        <div className="admin-hero-content">
          <h1 className="admin-hero-title">
            <span className="text-white">PANEL DE</span> <span className="text-red">ADMINISTRADOR</span>
          </h1>
          <p className="admin-hero-subtitle">VISIÓN GLOBAL DEL NEGOCIO, FINANZAS Y OPERACIONES</p>
        </div>
      </section>

      <main className="admin-main-content">
               
        <section className="admin-section">
          <h2 className="admin-section-title">OPERACIONES GENERALES</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">ÓRDENES ACTIVAS</span>
                <Wrench size={16} className="stat-icon text-red-icon" />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '...' : dashboardData.ordenesActivas}</span>
                <span className="stat-subtext text-green">DATOS EN TIEMPO REAL</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">EN TALLER</span>
                <Car size={16} className="stat-icon text-red-icon" />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '...' : dashboardData.enTaller}</span>
                <span className="stat-subtext text-yellow">{dashboardData.listosEntrega} LISTOS PARA ENTREGA</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">ALERTAS STOCK</span>
                <AlertCircle size={16} className="stat-icon text-yellow-icon" />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '...' : dashboardData.alertasStock}</span>
                <span className="stat-subtext text-red">REQUIEREN COMPRA</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">CLIENTES EN SISTEMA</span>
                <Users size={16} className="stat-icon text-red-icon" />
              </div>
              <div className="stat-body">
                <span className="stat-value">{loading ? '...' : dashboardData.totalClientes}</span>
                <span className="stat-subtext text-green">REGISTROS TOTALES</span>
              </div>
            </div>
          </div>
        </section>
        
        <div className="dashboard-bottom-grid">
          
          <section className="dashboard-card widget-finance">
            <div className="widget-header">
              <div className="widget-title-group">
                <BarChart2 size={20} className="widget-icon text-red-icon" />
                <h2 className="widget-title">RENDIMIENTO FINANCIERO</h2>
              </div>
              <select className="widget-select">
                <option>ESTE MES</option>
                <option>MES ANTERIOR</option>
                <option>ESTE AÑO</option>
              </select>
            </div>

            <div className="finance-stats-grid">              
              <div className="finance-sub-card">
                <span className="finance-label">FACTURACIÓN TOTAL</span>
                <div className="finance-value-group">
                  <span className="finance-value">
                    {loading ? '...' : formatCurrency(dashboardData.facturacionTotal)}
                  </span>
                  <TrendingUp size={16} className="text-green trend-icon" />
                </div>
              </div>
                         
              <div className="finance-sub-card">
                <span className="finance-label">TICKET PROMEDIO (OT)</span>
                <div className="finance-value-group">
                  <span className="finance-value">
                    {loading ? '...' : formatCurrency(dashboardData.ticketPromedio)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bar-chart-container">
              <div className="bar" style={{ height: '30%' }}></div>
              <div className="bar" style={{ height: '45%' }}></div>
              <div className="bar" style={{ height: '35%' }}></div>
              <div className="bar" style={{ height: '60%' }}></div>
              <div className="bar" style={{ height: '50%' }}></div>
              <div className="bar" style={{ height: '75%' }}></div>
              <div className="bar" style={{ height: '85%' }}></div>
            </div>
          </section>

          <section className="dashboard-card widget-access">
            <div className="widget-header">
              <div className="widget-title-group">
                <Shield size={20} className="widget-icon text-red-icon" />
                <h2 className="widget-title">CONTROL DE ACCESO</h2>
              </div>
            </div>

            <div className="access-items-container">
          
              <div className="access-item">
                <div className="access-info">
                  <span className="access-item-title">USUARIOS ACTIVOS</span>
                  <span className="access-item-subtitle">EN EL SISTEMA</span>
                </div>
                <span className="access-item-value text-red">
                  {loading ? '-' : dashboardData.usuariosActivos}
                </span>
              </div>

              <div style={{ marginTop: '1.5rem', backgroundColor: '#111622', padding: '1rem', borderRadius: '4px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d1d5db', letterSpacing: '0.05em' }}>REGISTRO DE USUARIOS</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', minHeight: '180px' }}>
                  {loadingLista ? (
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Cargando página {page}...</span>
                  ) : (
                    usuariosLista.map(u => (
                      <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #1f2937' }}>
                        <span style={{ fontSize: '0.8rem', color: '#fff' }}>{u.nombre}</span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>{u.rol?.nombre || 'Usuario'}</span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  
                  <button 
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    style={{ background: 'transparent', border: '1px solid #374151', color: page === 1 ? '#4b5563' : '#fff', padding: '0.5rem', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.1em' }}>
                    PÁGINA {page} DE {totalPages || 1}
                  </span>

                  <button 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages || totalPages === 0}
                    style={{ background: 'transparent', border: '1px solid #374151', color: (page === totalPages || totalPages === 0) ? '#4b5563' : '#fff', padding: '0.5rem', borderRadius: '4px', cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* =========================================================
            NUEVA SECCIÓN: TABLA DE ÓRDENES EN CURSO CON DIAGNÓSTICO
            ========================================================= */}
        <section className="dashboard-card" style={{ marginTop: '1.5rem', overflowX: 'auto', padding: '2rem' }}>
          <div className="widget-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
            <div className="widget-title-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={20} className="text-red-icon" style={{color: '#ef4444'}} />
              <h2 className="widget-title" style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', letterSpacing: '0.05em' }}>
                MONITOREO DE ÓRDENES EN CURSO
              </h2>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#ef4444', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '1px solid #1f2937' }}>
                <th style={{ padding: '1rem 0' }}>ID OT</th>
                <th style={{ padding: '1rem 0' }}>VEHÍCULO</th>
                <th style={{ padding: '1rem 0' }}>DIAGNÓSTICO / FALLA</th>
                <th style={{ padding: '1rem 0' }}>MECÁNICO</th>
                <th style={{ padding: '1rem 0' }}>ESTATUS</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrdenes ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Cargando detalles...</td>
                </tr>
              ) : ordenesRecientes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No hay órdenes en curso para mostrar.</td>
                </tr>
              ) : (
                ordenesRecientes.map(ot => {
                  const vehiculo = ot.diagnosticos?.vehiculos;
                  const vehiculoPlaca = vehiculo?.placa || 'S/N Placa';
                  const vehiculoInfo = vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Detalles no disponibles';
                  const falla = ot.diagnosticos?.fallaDetectada || 'Sin diagnóstico registrado';
                  const mecanico = ot.mecanico?.nombre || 'No asignado';

                  return (
                    <tr key={ot.id} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '1rem 0', color: '#fff', fontWeight: 'bold' }}>
                        OT-{String(ot.id).padStart(4, '0')}
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{vehiculoPlaca}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{vehiculoInfo}</div>
                      </td>
                      <td style={{ padding: '1rem 0', color: '#d1d5db' }}>
                        <div style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={falla}>
                          {falla}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0', color: '#9ca3af' }}>
                        {mecanico}
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          border: '1px solid #374151', 
                          color: '#d1d5db' 
                        }}>
                          {ot.estatus ? ot.estatus.toUpperCase() : 'DESCONOCIDO'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
};

export default Dashboard_Admin;