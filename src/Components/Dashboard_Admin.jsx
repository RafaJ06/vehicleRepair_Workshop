import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Car, 
  AlertCircle, 
  Users, 
  BarChart2, 
  TrendingUp, 
  Shield, 
  UserCog, 
  ChevronRight 
} from 'lucide-react';
import '../Style/Dashboard_Admin.css';
import {url} from '../App.jsx'

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', { 
      style: 'currency', 
      currency: 'DOP',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const resOrdenes = await fetch(`${url}/api/reportes/ordenes-por-estado`);
        const ordenesPorEstado = await resOrdenes.json();
        
        const activas = ordenesPorEstado
          .filter(o => !['CERRADA', 'CANCELADA'].includes(o.estado))
          .reduce((acc, o) => acc + o.total, 0);
          
        const enTaller = ordenesPorEstado
          .filter(o => ['EN_DIAGNOSTICO', 'EN_REPARACION'].includes(o.estado))
          .reduce((acc, o) => acc + o.total, 0);

        const listos = ordenesPorEstado
          .find(o => o.estado === 'LISTO' || o.estado === 'LISTO_PARA_ENTREGA')?.total || 0;

        const resStock = await fetch(url +`${url}/api/reportes/inventario-bajo-stock`);
        const stockData = await resStock.json();
        const alertasStock = stockData.length;

        const resClientes = await fetch(url +`${url}/api/clientes?limit=1`);
        const clientesData = await resClientes.json();
        const totalClientes = clientesData.total || 0;

        const resFinanzas = await fetch(url +`${url}/api/reportes/facturacion`);
        const finanzasData = await resFinanzas.json();
        const facturacionTotal = finanzasData.totalFacturado || 0;
        const ticketPromedio = finanzasData.cantidadFacturas > 0 
          ? facturacionTotal / finanzasData.cantidadFacturas 
          : 0;

        const resUsuarios = await fetch(url +`${url}/api/usuarios`);
        const usuariosData = await resUsuarios.json();
        const usuariosActivos = usuariosData.filter(u => u.activo).length;

        setDashboardData({
          ordenesActivas: activas,
          enTaller: enTaller,
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

  return (
    <div className="admin-container">
      
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

              <button className="access-action-btn">
                <div className="btn-left">
                  <UserCog size={16} className="btn-icon" />
                  <span>GESTIONAR EMPLEADOS</span>
                </div>
                <ChevronRight size={16} className="btn-chevron" />
              </button>
            </div>
          </section>

        </div>

      </main>
    </div>
  );
};

export default Dashboard_Admin;