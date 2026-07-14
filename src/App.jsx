import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Components/Auth';
import Dashboard_Admin from './Components/Dashboard_Admin';
import Dashboard_personal from './Components/Dashboard_personal';
import Gestion_Usuarios from './Components/Gestion_Usuarios';
import OTS from './Components/OTS';
import Clientes from './Components/Gestion_Clientes';
import Inventario from './Components/Inventario';
import Revision from './Components/Revision';
import CuentasPorCobrar from './Components/CuentasPorCobrar';

export const URL = "http://localhost:4000";

const ROLES_ADMIN = ['admin', 'administrador', 'Usuario'];

function obtenerRolUsuario() {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const rol = usuario?.rol?.nombre || usuario?.rol || usuario?.role || '';
    return String(rol).toLowerCase().trim();
  } catch (error) {
    return '';
  }
}

function RutaPersonal({ children }) {
  return ROLES_ADMIN.includes(obtenerRolUsuario()) ? <Navigate to="/admin" replace /> : children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Auth />} />

          <Route path="/admin" element={<Dashboard_Admin />} />
          <Route path="/admin/usuarios" element={<Gestion_Usuarios />} /> 
          <Route path="/admin/OTS" element={<OTS />} />
          <Route path="/admin/clientes" element={<Clientes />} />
          <Route path="/admin/inventario" element={<Inventario />} />
          <Route path="/admin/Revision" element={<Revision />} />
           <Route path="/admin/cuentas-por-cobrar" element={<CuentasPorCobrar />} />

          
          <Route path="/personal" element={<RutaPersonal><Dashboard_personal /></RutaPersonal>} />
          <Route path="/personal/OTS" element={<OTS />} />
          <Route path="/personal/clientes" element={<Clientes />} />
          <Route path="/personal/inventario" element={<Inventario />} />
          <Route path="/personal/Revision" element={<Revision />} />
          <Route path="/personal/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
         
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;