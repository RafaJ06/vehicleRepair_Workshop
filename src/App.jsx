import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Components/Auth';
import Dashboard_Admin from './Components/Dashboard_Admin';
import Dashboard_personal from './Components/Dashboard_personal';
import Client_Dashboard from './Components/Client_Dashboard';
import Gestion_Usuarios from './Components/Gestion_Usuarios';
import OTS from './Components/OTS';

export const URL ="http://localhost:4000"
function App() {
  
  return (
    <div className="App">
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        <Route path="/admin" element={<Dashboard_Admin />} />
        <Route path="/personal" element={<Dashboard_personal />} />
        <Route path="/clientes" element={<Client_Dashboard />} />
        <Route path="/admin/usuarios" element={<Gestion_Usuarios />} />
        <Route path="/admin/OTS" element={<OTS />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}
export default App;

