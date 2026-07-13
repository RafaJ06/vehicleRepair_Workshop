import { useState } from 'react';
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

      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario || data)); 
      } else {
        throw new Error('El servidor no devolvió un token válido.');
      }

      const encontrarRol = (obj) => {
        if (!obj || typeof obj !== 'object') return '';
        
        if (obj.rol && obj.rol.nombre) return obj.rol.nombre;
        if (obj.rol && typeof obj.rol === 'string') return obj.rol;
        if (obj.role && typeof obj.role === 'string') return obj.role; 
        
        for (const key in obj) {
          if (typeof obj[key] === 'object') {
            const resultado = encontrarRol(obj[key]);
            if (resultado) return resultado;
          }
        }
        return ''; 
      };

      const rolEncontrado = encontrarRol(data);
      const rolUsuario = String(rolEncontrado).toLowerCase().trim();

      
      if (['admin', 'administrador', 'supervisor'].includes(rolUsuario)) {
        navigate('/admin'); 
      } else if (['mecanico', 'recepcionista', 'personal'].includes(rolUsuario)) {
        navigate('/personal'); 
      } else if (['cliente', 'usuario'].includes(rolUsuario)) {
        navigate('/clientes'); 
      } else {
        console.error("JSON Recibido desde la API:", data);
        throw new Error(`Acceso denegado: El rol "${rolUsuario || 'Desconocido'}" no tiene un dashboard asignado.`);
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
