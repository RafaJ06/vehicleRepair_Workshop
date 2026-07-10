import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Wrench, User, Car, ArrowRight, AlertCircle } from 'lucide-react';
import Dashboard_personal from '../Components/Dashboard_personal';
import Client_Dashboard from '../Components/Client_Dashboard';
import Dashboard_Admin from '../Components/Dashboard_Admin';
import {url} from '../App';
import '../Style/Auth.css';

const Auth = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales incorrectas');
      }

      const data = await response.json();
      
      const rolUsuario = data.usuario?.rol?.nombre?.toLowerCase() || data.rol?.toLowerCase();

      if (rolUsuario === 'admin' || rolUsuario === 'administrador') {
        navigate(Dashboard_Admin);
      } else if (['mecanico', 'recepcionista', 'personal'].includes(rolUsuario)) {
        navigate(Dashboard_personal);
      } else if (rolUsuario === 'cliente') {
        navigate(Client_Dashboard);
      } else {
        throw new Error('Rol no reconocido por el sistema.');
      }

    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
          
          {error && (
            <div className="error-message" style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '4px', border: '1px solid #7f1d1d' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">User</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <User size={16} />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="submit-button-container">
            <button type="submit" className="submit-button" disabled={isLoading}>
              <span>{isLoading ? 'Verificando...' : 'Ingresar'}</span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Auth;