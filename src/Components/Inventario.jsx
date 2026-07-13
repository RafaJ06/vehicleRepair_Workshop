import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Edit, PackagePlus, X } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import '../Style/Inventario.css';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const Inventario = () => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para el Modal de Crear/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    precio_unitario: '',
    stock: '',
    id_impuesto: '' 
  });

  // Estados exclusivos para el Modal de Ajustar Stock
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockItem, setStockItem] = useState(null);
  const [stockAmount, setStockAmount] = useState('');

  const navigate = useNavigate();

  const handleAuthError = useCallback((status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/');
      throw new Error('Sesión expirada o permisos insuficientes.');
    }
  }, [navigate]);

  const fetchInventario = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${URL}/api/inventario`, {
        headers: getAuthHeaders()
      });
      
      handleAuthError(response.status);
      if (!response.ok) throw new Error('Error al obtener el inventario');
      
      const data = await response.json();

      if (Array.isArray(data)) {
        setMateriales(data);
      } else if (data && Array.isArray(data.data)) {
        setMateriales(data.data);
      } else {
        setMateriales([]);
      }
    } catch (err) {
      setError(err.message);
      setMateriales([]); 
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    Promise.resolve().then(fetchInventario);
  }, [fetchInventario]);

  const openStockModal = (item) => {
    setStockItem(item);
    setStockAmount('');
    setIsStockModalOpen(true);
  };

  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setStockItem(null);
    setStockAmount('');
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    
    const cantidadNum = Number(stockAmount);
    if (isNaN(cantidadNum) || cantidadNum === 0) {
      return alert("Por favor ingresa una cantidad válida distinta de cero.");
    }

    setFormLoading(true);

    try {
      const response = await fetch(`${URL}/api/inventario/${stockItem.id_material}/ajustar-stock`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cantidad: cantidadNum })
      });
      
      handleAuthError(response.status);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al ajustar el stock');
      }
      
      closeStockModal();
      fetchInventario(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };


  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ nombre: '', precio_unitario: '', stock: '', id_impuesto: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre || '',
      precio_unitario: item.precio_unitario || '',
      stock: item.stock || 0,
      id_impuesto: item.id_impuesto || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const endpoint = editingItem ? `${URL}/api/inventario/${editingItem.id_material}` : `${URL}/api/inventario`;
      const method = editingItem ? 'PUT' : 'POST';

      const payload = {
        nombre: formData.nombre,
        precio_unitario: Number(formData.precio_unitario),
        stock: formData.stock ? Number(formData.stock) : 0,
        ...(formData.id_impuesto && { id_impuesto: Number(formData.id_impuesto) })
      };

      const response = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      handleAuthError(response.status);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al guardar el artículo');
      }

      closeModal();
      fetchInventario();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // Formateador de moneda 
  const formatPrice = (price) => {
    return '$' + Number(price).toLocaleString('es-ES');
  };

  return (
    <div className="inventario-container">
      <AdminHeader />

      <main className="inventario-main">
               
        <div className="inventario-page-header">
          <h1 className="inventario-page-title">INVENTARIO GENERAL</h1>
          <button className="btn-create-item" onClick={openCreateModal}>
            <Plus size={16} strokeWidth={3} />
            <span>NUEVO ARTÍCULO</span>
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ================= GRID DE TARJETAS ================= */}
        {loading ? (
          <div className="text-center py-4 text-gray">Cargando inventario...</div>
        ) : materiales.length === 0 ? (
          <div className="text-center py-4 text-gray">El inventario está vacío.</div>
        ) : (
          <div className="inventario-grid">
            {materiales.map((item) => (
              <div key={item.id_material} className="inventario-card">
                
                <h3 className="card-title">{item.nombre}</h3>
                <div className="card-price">{formatPrice(item.precio_unitario)}</div>
                <div className="card-stock">Stock: {item.stock}</div>
               
                <div className="card-actions">
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => openEditModal(item)}
                    title="Editar Artículo"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn stock-btn" 
                    onClick={() => openStockModal(item)} // <--- AHORA ABRE EL MODAL
                    title="Ajustar Stock (+/-)"
                  >
                    <PackagePlus size={16} />
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </main>

      
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h3>{editingItem ? 'EDITAR ARTÍCULO' : 'CREAR ARTÍCULO'}</h3>
              <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre del Artículo</label>
                <input 
                  type="text" 
                  required 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej. FILTRO DE ACEITE"
                />
              </div>

              <div className="form-group-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Precio Unitario</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={formData.precio_unitario} 
                    onChange={(e) => setFormData({...formData, precio_unitario: e.target.value})}
                    placeholder="Ej. 15000"
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stock Inicial</label>
                  <input 
                    type="number" 
                    required={!editingItem} 
                    min="0"
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="Ej. 45"
                    disabled={!!editingItem} 
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading}>
                  {formLoading ? 'GUARDANDO...' : 'GUARDAR ARTÍCULO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStockModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>AJUSTAR STOCK</h3>
              <button className="close-modal-btn" onClick={closeStockModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleStockSubmit} className="modal-form">
              <div style={{ marginBottom: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                Artículo: <strong style={{color: '#ffffff', letterSpacing: '1px'}}>{stockItem?.nombre}</strong><br/>
                Stock actual: <strong style={{color: '#ffffff'}}>{stockItem?.stock} unidades</strong>
              </div>

              <div className="form-group">
                <label>Cantidad a sumar o restar</label>
                <input 
                  type="number" 
                  required 
                  value={stockAmount} 
                  onChange={(e) => setStockAmount(e.target.value)}
                  placeholder="Ej. 10 (para sumar) o -5 (para restar)"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeStockModal}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading}>
                  {formLoading ? 'APLICANDO...' : 'APLICAR AJUSTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventario;
