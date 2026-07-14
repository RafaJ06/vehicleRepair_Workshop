import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Wrench, User, Car, ArrowRight, AlertCircle } from 'lucide-react';
import{URL} from '../App';
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
      const response = await fetch(`${URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

      if (!data.token) {
        throw new Error('El servidor no devolvió un token válido.');
      }

      localStorage.setItem('token', data.token);

      const usuario = data.usuario || data;
      localStorage.setItem('usuario', JSON.stringify(usuario));

      
      console.log('Respuesta del login:', data);

      const rolUsuario = String(
        usuario?.rol?.nombre || usuario?.rol || usuario?.role || ''
      ).toLowerCase().trim();

      console.log('Rol detectado:', rolUsuario);

      if (['admin', 'administrador', 'supervisor'].includes(rolUsuario)) {
        navigate('/admin'); 
      } else if (['mecanico', 'recepcionista', 'personal'].includes(rolUsuario)) {
        navigate('/personal'); 
      } else if (['cliente', 'usuario'].includes(rolUsuario)) {
        navigate('/clientes'); 
      } else {
        throw new Error(`Acceso denegado: el rol "${rolUsuario || 'desconocido'}" no tiene un dashboard asignado.`);
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
            <label className="form-label">Usuario</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <User size={16} />
              </div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
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