import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, LogOut, Shield } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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

export const AdminHeader = () => {
  const [userName, setUserName] = useState('USUARIO');
  const [userRole, setUserRole] = useState('ADMINISTRADOR');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userDataString = localStorage.getItem('usuario');
    
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        
        if (userData.nombre) setUserName(userData.nombre.toUpperCase());

        const encontrarRol = (obj) => {
          if (!obj || typeof obj !== 'object') return '';
          if (obj.rol && obj.rol.nombre) return obj.rol.nombre;
          if (obj.rol && typeof obj.rol === 'string') return obj.rol;
          return '';
        };

        const rolEncontrado = encontrarRol(userData);
        if (rolEncontrado) setUserRole(String(rolEncontrado).toUpperCase());
        
      } catch (error) {
        console.error("Error parseando los datos del usuario:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

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