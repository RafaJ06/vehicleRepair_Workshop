import React from 'react';
import {Header_Personal} from './Header';
import '../Style/Dashboard_Personal.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Header_Personal />
      <section className="hero-banner">
        <div className="hero-content">
          <h2 className="hero-subtitle">SISTEMA DE GESTIÓN</h2>
          <h1 className="hero-title">
            Taller Mecánico<br />
            Central
          </h1>
          <div className="hero-badge">ADMIN PANEL</div>
        </div>
      </section>

      <main className="stats-section">
        <div className="stats-grid">
          
          <div className="stat-card">
            <span className="stat-tag tag-warning">ACTIVAS</span>
            <h3 className="stat-value">12 Órdenes (OT)</h3>
          </div>

          <div className="stat-card">
            <span className="stat-tag tag-danger">EN TALLER</span>
            <h3 className="stat-value">8 Vehículos</h3>
          </div>

          <div className="stat-card">
            <span className="stat-tag tag-warning">ALERTAS</span>
            <h3 className="stat-value">3 Repuestos bajos</h3>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Dashboard;