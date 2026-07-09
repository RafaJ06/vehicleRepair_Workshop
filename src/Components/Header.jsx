import { Wrench, LogOut } from 'lucide-react';
import '../Style/Header.css';



const Header_Personal = () => {

return (
<header className="navbar">
                <div className="navbar-brand">
          <Wrench className="brand-icon" size={20} />
          <span className="brand-title">Taller Mecánico</span>
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

        <div className="navbar-user">
          <button className="logout-button" title="Cerrar Sesión">
            <LogOut size={20} />
          </button>
        </div>
      </header>

    );

};
const Header_Client = () => {

  return (
    <header className="navbar">
                <div className="navbar-brand">
          <Wrench className="brand-icon" size={20} />
          <span className="brand-title">Taller Mecánico</span>
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

        <div className="navbar-user">
          <button className="logout-button" title="Cerrar Sesión">
            <LogOut size={20} />
          </button>
        </div>
      </header>



  );
};
export { Header_Personal, Header_Client };
        