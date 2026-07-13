import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, LogOut, Shield, Banknote } from 'lucide-react';
import { useState } from 'react';
import '../Style/Header.css';

export const Header_Personal = () => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <Wrench className="brand-icon" size={20} />
          <span className="brand-title">Taller Mecánico</span>
        </div>
      </div>

      <nav className="navbar-menu">
        <a href="#panel" className="nav-link active">PANEL</a>
        <a href="#ordenes" className="nav-link">ÓRDENES (OT)</a>
        <a href="#inventario" className="nav-link">INVENTARIO</a>
        <a href="#clientes" className="nav-link">CLIENTES</a>
        <a href="#vehiculos" className="nav-link">VEHÍCULOS</a>
        <span className="nav-separator">|</span>
        <a href="#facturacion" className="nav-link">FACTURACIÓN</a>
      </nav>

      <div className="navbar-right">
        <button className="navbar-logout-left" title="Cerrar Sesión">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export const Header_Client = () => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <Wrench className="brand-icon" size={20} />
          <span className="brand-title">Taller Mecánico</span>
        </div>
      </div>

      <nav className="navbar-menu">
        <a href="#panel" className="nav-link active">PANEL</a>
        <a href="#ordenes" className="nav-link">ÓRDENES</a>
        <a href="#inventario" className="nav-link">INVENTARIO</a>
        <a href="#clientes" className="nav-link">CLIENTES</a>
        <a href="#vehiculos" className="nav-link">VEHÍCULOS</a>
        <span className="nav-separator">|</span>
        <a href="#facturacion" className="nav-link">FACTURACIÓN</a>
      </nav>

      <div className="navbar-right">
        <button className="navbar-logout-left" title="Cerrar Sesión">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

const readStoredUser = () => {
  const defaults = { userName: 'USUARIO', userRole: 'ADMINISTRADOR' };
  const userDataString = localStorage.getItem('usuario');
  if (!userDataString) return defaults;
  try {
    const userData = JSON.parse(userDataString);
    const role = userData?.rol?.nombre ?? (typeof userData?.rol === 'string' ? userData.rol : '');
    return {
      userName: userData?.nombre ? String(userData.nombre).toUpperCase() : defaults.userName,
      userRole: role ? String(role).toUpperCase() : defaults.userRole,
    };
  } catch (error) {
    console.error('Error parseando los datos del usuario:', error);
    return defaults;
  }
};

export const AdminHeader = () => {
  const [userInfo] = useState(readStoredUser);
  const { userName, userRole } = userInfo;
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const canViewReceivables = ['ADMINISTRADOR', 'ADMIN', 'SUPERVISOR', 'RECEPCIONISTA'].includes(userRole);

  return (
    <header className="navbar">
      
      <div className="navbar-left">
        <div className="navbar-brand">
          <Wrench size={20} className="brand-icon" />
          <span>ADMIN PRO</span>
        </div>
      </div>

      <nav className="navbar-menu">
        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>PANEL</Link>
        <Link to="/admin/OTS" className={`nav-link ${isActive('/admin/OTS') ? 'active' : ''}`}>OTS</Link>
        <Link to="/admin/inventario" className={`nav-link ${isActive('/admin/inventario') ? 'active' : ''}`}>INVENTARIO</Link>
        <Link to="/admin/clientes" className={`nav-link ${isActive('/admin/clientes') ? 'active' : ''}`}>CLIENTES</Link>
        <Link to="/admin/vehiculos" className={`nav-link ${isActive('/admin/vehiculos') ? 'active' : ''}`}>VEHÍCULOS</Link>
        {canViewReceivables && (
          <Link to={userRole === 'RECEPCIONISTA' ? '/personal/cuentas-por-cobrar' : '/admin/cuentas-por-cobrar'} className={`nav-link ${location.pathname.endsWith('/cuentas-por-cobrar') ? 'active' : ''}`}>
            <Banknote size={16} />
            <span>CUENTAS POR COBRAR</span>
          </Link>
        )}
        <span className="nav-separator">|</span>
        <Link to="/admin/usuarios" className={`nav-link ${isActive('/admin/usuarios') ? 'active' : ''}`}>
          <Shield size={16} />
          <span>USUARIOS</span>
        </Link>
      </nav>

      <div className="navbar-right">
        <button className="navbar-logout-left" onClick={handleLogout} title="Cerrar Sesión">
          <LogOut size={20} />
        </button>
        <div className="navbar-user-info">
          <span className="user-name">{userName}</span>
          <span className="user-role">{userRole}</span>
        </div>
      </div>

    </header>
  );
};
