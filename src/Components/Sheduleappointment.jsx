import { useState } from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import {Header_Client} from './Header';
import '../Style/ScheduleAppointment.css';


const ScheduleAppointment = () => {
  const [formData, setFormData] = useState({
    vehiculo: '',
    fecha: '',
    motivo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Cita agendada:', formData);
  };

  return (
    <div className="appointment-container">
      <Header_Client/>
      <section className="portal-hero">
        <h1 className="hero-greeting">
          BIENVENIDO, <span className="text-red">Diego</span>
        </h1>
        <p className="hero-description">
          Aquí puedes revisar el estado de tus vehículos y agendar nuevos mantenimientos.
        </p>
      </section>

      <main className="appointment-main">
        
        <div className="section-header">
          <Calendar className="section-icon" size={24} />
          <h2 className="section-title">AGENDAR NUEVA CITA</h2>
        </div>
        
        <div className="form-card">
          <form onSubmit={handleSubmit} className="appointment-form">
            
           
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SELECCIONAR VEHÍCULO</label>
                <select 
                  className="form-control form-select"
                  value={formData.vehiculo}
                  onChange={(e) => setFormData({...formData, vehiculo: e.target.value})}
                  required
                >
                  <option value="" disabled hidden>Selecciona un vehículo...</option>
                  <option value="AB-CD-12">Toyota Yaris - AB-CD-12</option>
                  <option value="WW-KK-55">Chevrolet Spark - WW-KK-55</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">FECHA DESEADA</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
            </div>

            
            <div className="form-group">
              <label className="form-label">MOTIVO DE LA VISITA</label>
              <textarea 
                className="form-control text-area" 
                rows="4"
                placeholder="Ej: Mantenimiento de los 50.000km, o Ruido extraño en el motor..."
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                required
              ></textarea>
            </div>

            <div className="form-submit">
              <button type="submit" className="btn-confirm">
                CONFIRMAR CITA
                <CheckCircle size={18} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ScheduleAppointment;
