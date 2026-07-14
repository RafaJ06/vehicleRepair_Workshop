import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const usuarioStr = localStorage.getItem('usuario');
  const usuarioActivo = usuarioStr ? JSON.parse(usuarioStr) : {};
  
  const nombreRol = String(usuarioActivo.rol?.nombre || usuarioActivo.rol || '').toLowerCase();
  const idRol = Number(usuarioActivo.rolId);

  const esAdmin = idRol === 9 || idRol === 9 || nombreRol === 'administrador';

  const baseUrl = esAdmin ? '/admin' : '/personal';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname.includes(path);
    return {
      color: isActive ? '#ff0000' : '#9ca3af',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      transition: 'color 0.2s'
    };
  };

  return (
    <header style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '1.25rem 5%', backgroundColor: '#07090e', borderBottom: '1px solid #1f2937' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        
        <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.05em' }}>
          TALLER <span style={{ color: '#ff0000' }}>PRO</span>
        </h2>

        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to={`${baseUrl}`} style={getLinkStyle('/admin', true)}>Dashboard</Link>
          <Link to={`${baseUrl}/clientes`} style={getLinkStyle('/clientes')}>Clientes</Link>
          <Link to={`${baseUrl}/Revision`} style={getLinkStyle('/Revision')}>Vehículos</Link>
          <Link to={`${baseUrl}/inventario`} style={getLinkStyle('/inventario')}>Inventario</Link>
          <Link to={`${baseUrl}/OTS`} style={getLinkStyle('/OTS')}>Órdenes (OT)</Link>   
          <Link to={`${baseUrl}/cuentas-por-cobrar`} style={getLinkStyle('/cuentas-por-cobrar')}>Facturacion</Link>                 
          
          
          {esAdmin && (
            <Link to="/admin/usuarios" style={getLinkStyle('/usuarios')}>Usuarios</Link>
          )}
        </nav>

      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {usuarioActivo.nombre || 'Usuario'}
          </div>
          <div style={{ color: '#ff0000', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em' }}>
            {esAdmin ? 'ADMINISTRADOR' : 'PERSONAL TÉCNICO'}
          </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          style={{ 
            background: 'transparent', border: '1px solid #374151', color: '#9ca3af', 
            padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' 
          }}
          title="Cerrar Sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export const Header_Client = () => {
  
  return (
    <header>Header Cliente</header>
  );
}