import React from 'react';
import {Car, Calendar } from 'lucide-react';
import '../Style/Client_Dashboard.css';
import {Header_Client} from './Header';

const ClientDashboard = () => {
  return (
    <div className="dashboard-container">
      <Header_Client />

      <section className="hero-banner">
        <div className="hero-content">
          <h2 className="hero-subtitle">BIENVENIDO</h2>
          <h1 className="hero-title">
            Portal de<br />
            Clientes
          </h1>
          <div className="hero-badge">CLIENT PANEL</div>
        </div>
      </section>

      
      <main className="garage-section">
        <div className="garage-container">
          
          <div className="garage-header">
            <Car className="garage-icon-title" size={24} />
            <h2 className="garage-title">MI GARAJE</h2>
          </div>

          <div className="vehicle-grid">
            
            <div className="vehicle-card">
              <div className="plate-badge">AB-CD-12</div>
              
              <div className="vehicle-icon-wrapper">
                <Car className="vehicle-icon" size={32} />
              </div>
              
              <div className="vehicle-info">
                <h3 className="vehicle-make">TOYOTA</h3>
                <p className="vehicle-model">YARIS - 2020</p>
                <div className="service-badge">
                  <Calendar size={14} className="service-icon" />
                  <span>PRÓXIMO SERVICIO: 15 DIC 2026</span>
                </div>
              </div>
            </div>

            <div className="vehicle-card">
              <div className="plate-badge">WW-KK-55</div>
              
              <div className="vehicle-icon-wrapper">
                <Car className="vehicle-icon" size={32} />
              </div>
              
              <div className="vehicle-info">
                <h3 className="vehicle-make">CHEVROLET</h3>
                <p className="vehicle-model">SPARK - 2018</p>
                <div className="service-badge">
                  <Calendar size={14} className="service-icon" />
                  <span>PRÓXIMO SERVICIO: 20 SEP 2026</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default ClientDashboard;