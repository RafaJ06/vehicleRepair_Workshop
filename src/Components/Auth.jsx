import React, { useState } from 'react';
import { Wrench, User, Car, ArrowRight } from 'lucide-react';
import '../Style/Auth.css';

const Auth = () => {
  const [rut, setRut] = useState('');
  const [patente, setPatente] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', { rut, patente });
  };

  return (
    <div className="portal-container">
      <div className="portal-overlay"></div>

      <div className="portal-card">
        
        <div className="portal-header">
          <div className="logo-circle">
            <Wrench className="logo-icon" />
          </div>
          <h1 className="portal-title">Taller Mecanico</h1>
        </div>

        <form onSubmit={handleSubmit} className="portal-form">
          
          <div className="form-group">
            <label className="form-label">User</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <User size={16} />
              </div>
              <input
                type="text"
                placeholder="Email"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Car size={16} />
              </div>
              <input
                type="password"
                placeholder="Contraseña"
                value={patente}
                onChange={(e) => setPatente(e.target.value)}
                className="form-input uppercase"
                required
              />
            </div>
          </div>

          <div className="submit-button-container">
            <button type="submit" className="submit-button">
              <span>Ingresar</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default Auth;