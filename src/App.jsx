import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Components/Auth';
import Dashboard_Admin from './Components/Dashboard_Admin';
import Dashboard_personal from './Components/Dashboard_personal';
import Gestion_Usuarios from './Components/Gestion_Usuarios';
import OTS from './Components/OTS';
import Clientes from './Components/Gestion_Clientes';
import Inventario from './Components/Inventario';
import Vehiculos from './Components/Vehiculos';

export const URL = "http://localhost:4000";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Auth />} />

          {/* ================= RUTAS DEL ADMINISTRADOR ================= */}
          <Route path="/admin" element={<Dashboard_Admin />} />
          <Route path="/admin/usuarios" element={<Gestion_Usuarios />} /> 
          <Route path="/admin/OTS" element={<OTS />} />
          <Route path="/admin/clientes" element={<Clientes />} />
          <Route path="/admin/inventario" element={<Inventario />} />
          <Route path="/admin/Vehiculos" element={<Vehiculos />} />

          {/* ================= RUTAS DEL PERSONAL ================= */}
          <Route path="/personal" element={<Dashboard_personal />} />
          <Route path="/personal/OTS" element={<OTS />} />
          <Route path="/personal/clientes" element={<Clientes />} />
          <Route path="/personal/inventario" element={<Inventario />} />
          <Route path="/personal/Vehiculos" element={<Vehiculos />} />
         
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;