import React from 'react';
import '../Style/Orders.css';
import {Header_Personal} from './Header';

const Orders = () => {
 
  const ordersData = [
    { id: 'OT-001', vehicle: 'AB-CD-12', client: 'XXXXXXXX', status: 'EN PROGRESO' },
    { id: 'OT-002', vehicle: 'XY-ZZ-99', client: 'XXXXXXXX ', status: 'COMPLETADA' },
    { id: 'OT-003', vehicle: 'WW-KK-55', client: 'XXXXXXXX', status: 'DIAGNÓSTICO' },
  ];

  return (
    
    <div className="orders-container">
      <Header_Personal />
      
      <div className="orders-header">
        <h1 className="orders-title">ÓRDENES DE TRABAJO (OT)</h1>
        <button className="btn-create-ot">
          <span>+</span> CREAR OT
        </button>
      </div>

      
      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID OT</th>
              <th>VEHÍCULO</th>
              <th>CLIENTE</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {ordersData.map((order, index) => (
              <tr key={index}>
                <td className="cell-bold">{order.id}</td>
                <td className="cell-bold">{order.vehicle}</td>
                <td className="cell-client">{order.client}</td>
                <td>
                  <span className="status-badge">{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Orders;