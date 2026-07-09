import React from 'react';
import { Wrench, LogOut, Activity, AlertCircle } from 'lucide-react';
import '../Style/ClientOrders.css';
import {Header_Client} from './Header';

const ClientOrders = () => {
  const orders = [
    {
      id: 'OT-001',
      status: 'EN PROGRESO',
      statusType: 'warning', 
      vehicle: 'AB-CD-12',
      date: '15 Jun 2026',
      amount: '$ 45.000',
      activeStage: 2, 
      report: 'Cambio de pastillas de freno y revisión de fluidos.'
    },
    {
      id: 'OT-003',
      status: 'DIAGNÓSTICO',
      statusType: 'default', 
      vehicle: 'WW-KK-55',
      date: '16 Jun 2026',
      amount: 'Pendiente',
      activeStage: 1,
      report: 'Evaluando ruido en el motor.'
    }
  ];

  const stages = ['RECEPCIÓN', 'DIAGNÓSTICO', 'REPARACIÓN', 'LISTO'];

  return (
    <div className="client-portal-container">
      
      <Header_Client/>

      <section className="portal-hero">
        <h1 className="hero-greeting">
          BIENVENIDO, <span className="text-red">Diego</span>
        </h1>
        <p className="hero-description">
          Aquí puedes revisar el estado de tus vehículos y agendar nuevos mantenimientos.
        </p>
      </section>

      <main className="orders-section">
        <center>
        <div className="section-header">
          <Activity className="section-icon" size={24} />
          <h2 className="section-title">ESTADO DE MIS VEHÍCULOS</h2>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              
              <div className="order-header">
                <div className="header-left">
                  <div className="order-title-row">
                    <h3 className="order-id">ORDEN {order.id}</h3>
                    <span className={`status-badge badge-${order.statusType}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="order-meta">
                    Vehículo: <span className="text-bold">{order.vehicle}</span> | Ingreso: {order.date}
                  </p>
                </div>
                <div className="header-right">
                  <span className="amount-label">MONTO ESTIMADO</span>
                  <span className="amount-value">{order.amount}</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-labels">
                  {stages.map((stage, index) => {
                    const isActive = index < order.activeStage;
                    return (
                      <span key={stage} className={`progress-label ${isActive ? 'label-active' : ''}`}>
                        {stage}
                      </span>
                    );
                  })}
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(order.activeStage / stages.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="report-box">
                <div className="report-header">
                  <AlertCircle size={18} className="report-icon" />
                  <h4 className="report-title">REPORTE TÉCNICO</h4>
                </div>
                <p className="report-text">{order.report}</p>
              </div>

            </div>
          ))}
        </div>
        </center>
      </main>
      

    </div>
  );
};

export default ClientOrders;