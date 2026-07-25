import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Edit, Trash2, X, Users, Search, Filter, ChevronLeft, ChevronRight, Eye, Car, Wrench, ExternalLink, Printer } from 'lucide-react';
import { URL } from '../App';
import { AdminHeader } from './Header'; 
import { API_FEATURES } from '../config/apiFeactures';
import { listarCuentasPorCobrar } from '../services/cuentasPorCobrar.service';
import '../Style/Gestion_Clientes.css';

const formatHistoryDate = (value) => value ? new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium' }).format(new Date(value)) : '—';
const HistoryInfo = ({ label, value }) => <div className="cxc-info"><span>{label}</span><strong>{value ?? '—'}</strong></div>;

// ================= TIPOS DE IDENTIFICACIÓN (ESTÁTICOS) =================
const TIPOS_IDENTIFICACION = [
  { id: 1, nombre: 'Cédula' },
  { id: 2, nombre: 'Pasaporte' },
  { id: 3, nombre: 'RNC' },
];

const VehicleHistoryBase = ({ vehicle, getHeaders, onAuthError }) => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [mechanics, setMechanics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = async () => {
    setOpen(value => !value);
    if (detail || loading) return;
    setLoading(true); setError('');
    try {
      const response = await fetch(`${URL}/api/vehiculos/${vehicle.id}`, { headers: getHeaders() });
      onAuthError(response.status);
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'No fue posible cargar el historial del vehículo.');
      setDetail(data);
      const orders = (data.diagnosticos || []).flatMap(diagnostic => diagnostic.ordenes_trabajo || []);
      const entries = await Promise.all(orders.map(async order => {
        try {
          const orderResponse = await fetch(`${URL}/api/ordenes-trabajo/${order.id}`, { headers: getHeaders() });
          onAuthError(orderResponse.status);
          if (!orderResponse.ok) throw new Error();
          const fullOrder = await orderResponse.json();
          return [order.id, fullOrder.mecanico?.nombre || (order.mecanicoId ? `ID ${order.mecanicoId}` : 'Sin asignar')];
        } catch { return [order.id, order.mecanicoId ? `ID ${order.mecanicoId}` : 'Sin asignar']; }
      }));
      setMechanics(Object.fromEntries(entries));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const data = detail || vehicle;
  return <article className="client-history-vehicle"><button type="button" onClick={toggle}><span><Car size={19} color="#ef4444" /><strong>{data.placa || 'SIN PLACA'}</strong><small>{data.marca} {data.modelo}</small></span>{open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>{open && <div className="client-history-body">{loading ? <div className="cxc-empty">Cargando historial…</div> : error ? <div className="cxc-alert"><AlertCircle size={18} />{error}</div> : <><div className="client-history-grid"><HistoryInfo label="Chasis" value={data.chasis} /><HistoryInfo label="Marca" value={data.marca} /><HistoryInfo label="Modelo" value={data.modelo} /><HistoryInfo label="Año" value={data.anio} /><HistoryInfo label="Color" value={data.color} /><HistoryInfo label="Estado" value={data.estado ? 'Activo' : 'Inactivo'} /></div><h4 className="client-history-modal-title"><Wrench size={18} color="#ef4444" /> DIAGNÓSTICOS Y ÓRDENES</h4>{!data.diagnosticos?.length ? <div className="cxc-empty">No hay diagnósticos para este vehículo.</div> : data.diagnosticos.map(diagnostic => <section className="client-history-diagnostic" key={diagnostic.id}><div className="client-history-diagnostic-title"><strong>DIAGNÓSTICO #{diagnostic.id}</strong><span className="cxc-status">{diagnostic.estatus || 'Sin estatus'}</span></div><div className="cxc-detail-grid"><HistoryInfo label="Fecha" value={formatHistoryDate(diagnostic.fecha)} /><HistoryInfo label="Falla detectada" value={diagnostic.fallaDetectada} /><HistoryInfo label="Presión baja" value={diagnostic.presionBaja} /><HistoryInfo label="Presión alta" value={diagnostic.presionAlta} /><HistoryInfo label="Temperatura" value={diagnostic.temperatura} /></div>{!diagnostic.ordenes_trabajo?.length ? <p className="text-gray">Sin órdenes relacionadas.</p> : <div className="cxc-table-wrap"><table className="cxc-table"><thead><tr><th>ORDEN</th><th>CREACIÓN</th><th>CIERRE</th><th>MECÁNICO</th><th>ESTATUS</th><th>FACTURA</th></tr></thead><tbody>{diagnostic.ordenes_trabajo.map(order => <tr key={order.id}><td>OT-{order.id}</td><td>{formatHistoryDate(order.fecha_creacion)}</td><td>{formatHistoryDate(order.fechaCierre)}</td><td>{mechanics[order.id] || 'Sin asignar'}</td><td><span className="cxc-status">{order.estatus || 'Sin estatus'}</span></td><td>{order.facturas ? `FAC-${order.facturas.id} · ${order.facturas.estatus}` : '—'}</td></tr>)}</tbody></table></div>}</section>)}</>}</div>}</article>;
};

const toHistoryArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
const historyAmount = (value) => {
  const number = Number(String(value ?? 0).replace(',', '.'));
  return new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(number) ? number : 0);
};

const ClientInvoicePrint = ({ invoice }) => {
  const client = invoice.clientes ?? invoice.cliente;
  const order = invoice.orderDetail ?? invoice.historyOrder ?? invoice.ordenTrabajo;
  const diagnostic = toHistoryArray(invoice.factura_diagnostico_puente).map(item => item.diagnosticos).find(Boolean)
    ?? invoice.historyDiagnostic
    ?? order?.diagnosticos;
  const vehicle = diagnostic?.vehiculos ?? invoice.historyVehicle;
  const account = toHistoryArray(invoice.cuentas_por_cobrar ?? invoice.cuentasPorCobrar).find(item => item.estado !== false);

  return (
    <article className="client-invoice-print">
      <header className="client-invoice-print-header"><div><strong>TALLER MECÁNICO</strong><span>FACTURA</span></div><div><b>FAC-{invoice.id}</b><span>{formatHistoryDate(invoice.fecha)}</span></div></header>
      <section className="client-invoice-print-meta">
        <div><span>CLIENTE</span><strong>{client?.nombre || 'No disponible'}</strong><small>{client?.identificacion || 'Identificación no disponible'}</small></div>
        <div><span>ORDEN / VEHÍCULO</span><strong>{order?.id ? `OT-${order.id}` : 'Orden no disponible'}</strong><small>{vehicle ? `${vehicle.placa || 'Sin placa'} · ${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim() : 'Vehículo no disponible'}</small></div>
        <div><span>DIAGNÓSTICO</span><strong>{diagnostic?.id ? `DG-${diagnostic.id}` : 'No disponible'}</strong><small>{diagnostic?.falla_detectada || diagnostic?.fallaDetectada || 'Falla no disponible'}</small></div>
      </section>
      <table className="client-invoice-print-table">
        <thead><tr><th>CONCEPTO</th><th>CANT.</th><th>PRECIO</th><th>IMPUESTO</th><th>SUBTOTAL</th></tr></thead>
        <tbody>{invoice.factura_detalles?.length ? invoice.factura_detalles.map(item => <tr key={item.id_detalle}><td>{item.materiales_repuestos?.nombre || 'Servicio'}</td><td>{item.cantidad}</td><td>{historyAmount(item.precio_unitario)}</td><td>{historyAmount(item.valor_impuesto)}</td><td>{historyAmount(item.subtotal_item)}</td></tr>) : <tr><td colSpan="5">Sin detalles registrados.</td></tr>}</tbody>
      </table>
      <section className="client-invoice-print-totals">
        <div><span>Subtotal</span><strong>{historyAmount(invoice.subtotal)}</strong></div><div><span>Impuestos</span><strong>{historyAmount(invoice.total_impuestos)}</strong></div><div className="total"><span>Total</span><strong>{historyAmount(invoice.total)}</strong></div>
        {account && <><div><span>Pagado</span><strong>{historyAmount(account.monto_pagado)}</strong></div><div><span>Pendiente</span><strong>{historyAmount(account.monto_pendiente)}</strong></div></>}
      </section>
      <footer>Estatus: {account?.estatus || invoice.estatus || 'No disponible'}</footer>
    </article>
  );
};

const VehicleHistory = ({ vehicle, getHeaders, onAuthError }) => {
  const navigate = useNavigate();
  const [showInvoices, setShowInvoices] = useState(false);
  const [records, setRecords] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [printableInvoice, setPrintableInvoice] = useState(null);

  const request = async (path) => {
    const response = await fetch(`${URL}${path}`, { headers: getHeaders() });
    onAuthError(response.status);
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || payload?.message || 'No fue posible consultar la factura.');
    return payload?.data ?? payload;
  };

  const loadInvoiceRecords = async () => {
    setShowInvoices(value => !value);
    if (records.length || actionLoading) return;
    setActionLoading(true);
    setActionError('');
    try {
      const fullVehicle = await request(`/api/vehiculos/${vehicle.id}`);
      const found = toHistoryArray(fullVehicle?.diagnosticos).flatMap(diagnostic =>
        toHistoryArray(diagnostic.ordenes_trabajo)
          .filter(order => order.facturas?.id)
          .map(order => ({ invoice: order.facturas, order, diagnostic, vehicle: fullVehicle })),
      );
      setRecords([...new Map(found.map(item => [item.invoice.id, item])).values()]);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openAccount = async (invoiceId) => {
    setActionLoading(true);
    setActionError('');
    try {
      let hasActiveAccount = false;
      if (API_FEATURES.cuentasPorCobrar) {
        const accounts = await listarCuentasPorCobrar({ facturaId: invoiceId });
        hasActiveAccount = accounts.some(account => account.estado && String(account.idFactura) === String(invoiceId));
      } else {
        
        const invoice = await request(`/api/facturas/${invoiceId}`);
        hasActiveAccount = toHistoryArray(invoice.cuentas_por_cobrar ?? invoice.cuentasPorCobrar).some(account => account.estado !== false);
      }
      if (!hasActiveAccount) {
        setActionError('Esta factura no tiene una cuenta por cobrar disponible');
        return;
      }
      const base = window.location.pathname.startsWith('/personal') ? '/personal/cuentas-por-cobrar' : '/admin/cuentas-por-cobrar';
      navigate(`${base}?facturaId=${invoiceId}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const printInvoice = async (record) => {
    setActionLoading(true);
    setActionError('');
    try {
      const invoice = await request(`/api/facturas/${record.invoice.id}`);
      let orderDetail = record.order;
      if (invoice.ordenTrabajo?.id) {
        try { orderDetail = await request(`/api/ordenes-trabajo/${invoice.ordenTrabajo.id}`); } catch { orderDetail = record.order; }
      }
      setPrintableInvoice({ ...invoice, orderDetail, historyOrder: record.order, historyDiagnostic: record.diagnostic, historyVehicle: record.vehicle });
      window.addEventListener('afterprint', () => setPrintableInvoice(null), { once: true });
      window.setTimeout(() => window.print(), 150);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHistoryInvoiceClick = (event) => {
    const cell = event.target.closest('td');
    if (!cell || cell.cellIndex !== 5) return;
    const match = cell.textContent.match(/FAC-(\d+)/i);
    if (match) openAccount(Number(match[1]));
  };

  return (
    <div className="client-history-integration" onClickCapture={handleHistoryInvoiceClick}>
      <VehicleHistoryBase vehicle={vehicle} getHeaders={getHeaders} onAuthError={onAuthError} />
      <button type="button" className="client-invoice-toggle" onClick={loadInvoiceRecords}><Printer size={16} /> ACCIONES DE FACTURAS DEL HISTORIAL</button>
      {actionError && <div className="cxc-alert client-invoice-error"><AlertCircle size={16} />{actionError}</div>}
      {showInvoices && <div className="client-invoice-actions-panel">
        {actionLoading && !records.length ? <div className="cxc-empty">Cargando facturas…</div> : !records.length ? <div className="cxc-empty">Este vehículo no tiene facturas relacionadas.</div> : records.map(record => <div className="client-invoice-action-row" key={record.invoice.id}>
          <div><strong>FAC-{record.invoice.id}</strong><span>{record.invoice.estatus || 'Sin estatus'} · OT-{record.order.id}</span></div>
          <div><button type="button" disabled={actionLoading} onClick={() => openAccount(record.invoice.id)}><ExternalLink size={15} /> VER CUENTA</button><button type="button" disabled={actionLoading} onClick={() => printInvoice(record)}><Printer size={15} /> IMPRIMIR</button></div>
        </div>)}
      </div>}
      {printableInvoice && <ClientInvoicePrint invoice={printableInvoice} />}
    </div>
  );
};

const Gestion_Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ================= ESTADOS DE CONTROLES (Buscador y Paginación) =================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recientes'); // recientes, a-z, z-a
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Cantidad de clientes por página

  // ================= ESTADOS DEL MODAL =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clientVehicles, setClientVehicles] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [formData, setFormData] = useState({
    id_tipo_identificacion: String(TIPOS_IDENTIFICACION[0].id),
    identificacion: '',
    nombre: '',
    telefono: '',
    direccion: '',
    email: ''
  });

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/');
      throw new Error('Sesión expirada o permisos insuficientes.');
    }
  };

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${URL}/api/clientes`, { headers: getAuthHeaders() });
      handleAuthError(response.status);
      if (!response.ok) throw new Error('Error al obtener los clientes');
      
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setClientes(data.data);
      } else if (Array.isArray(data)) {
        setClientes(data);
      } else {
        setClientes([]);
      }
    } catch (err) {
      setError(err.message);
      setClientes([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) fetchClientes(); });
    return () => { active = false; };
   
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) return;
    try {
      const response = await fetch(`${URL}/api/clientes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      handleAuthError(response.status);
      if (!response.ok) throw new Error('Error al eliminar el cliente');
      setClientes(clientes.filter(cliente => cliente.id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const openClientDetail = async (cliente) => {
    setSelectedCliente(cliente); setClientVehicles([]); setDetailLoading(true); setDetailError('');
    try {
      const [clientResponse, vehiclesResponse] = await Promise.all([
        fetch(`${URL}/api/clientes/${cliente.id}`, { headers: getAuthHeaders() }),
        fetch(`${URL}/api/vehiculos?clienteId=${cliente.id}`, { headers: getAuthHeaders() })
      ]);
      handleAuthError(clientResponse.status); handleAuthError(vehiclesResponse.status);
      const clientData = await clientResponse.json().catch(() => null);
      const vehiclesData = await vehiclesResponse.json().catch(() => null);
      if (!clientResponse.ok) throw new Error(clientData?.error || 'No fue posible obtener el detalle del cliente.');
      if (!vehiclesResponse.ok) throw new Error(vehiclesData?.error || 'No fue posible obtener los vehículos del cliente.');
      const detailedClient = Array.isArray(clientData) ? clientData[0] : clientData;
      setSelectedCliente({ ...cliente, ...(detailedClient || {}) });
      setClientVehicles(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || []);
    } catch (err) { setDetailError(err.message); }
    finally { setDetailLoading(false); }
  };

  const closeClientDetail = () => {
    setSelectedCliente(null); setClientVehicles([]); setDetailError('');
  };

  // ================= LÓGICA DE PROCESAMIENTO (Búsqueda, Orden y Paginación) =================

  // 1. Filtrar por búsqueda
  let processedClientes = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (cliente.nombre || '').toLowerCase().includes(searchLower) ||
      (cliente.identificacion || '').toLowerCase().includes(searchLower) ||
      (cliente.email || '').toLowerCase().includes(searchLower)
    );
  });

  // 2. Ordenar
  if (sortOption === 'a-z') {
    processedClientes.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  } else if (sortOption === 'z-a') {
    processedClientes.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
  } else {
    // Si tuvieras un ID autoincremental o fecha de creación, se ordenaría aquí.
    // Por defecto lo dejamos como viene de la API.
  }

  // 3. Paginación
  const totalPages = Math.ceil(processedClientes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedClientes.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // ================= MANEJO DE MODALES =================
  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData({ id_tipo_identificacion: String(TIPOS_IDENTIFICACION[0].id), identificacion: '', nombre: '', telefono: '', direccion: '', email: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      id_tipo_identificacion: cliente.id_tipo_identificacion ? String(cliente.id_tipo_identificacion) : String(TIPOS_IDENTIFICACION[0].id),
      identificacion: cliente.identificacion || '',
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      email: cliente.email || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const identificationTypeId = Number(formData.id_tipo_identificacion);
    if (!Number.isInteger(identificationTypeId) || identificationTypeId <= 0) {
      alert('Seleccione un tipo de identificación válido');
      return;
    }
    if (!formData.identificacion.trim() || !formData.nombre.trim()) return;
    setFormLoading(true);
    try {
      const endpoint = editingCliente ? `${URL}/api/clientes/${editingCliente.id}` : `${URL}/api/clientes`;
      const method = editingCliente ? 'PUT' : 'POST';
      const payload = { 
        ...formData, 
        id_tipo_identificacion: identificationTypeId
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      handleAuthError(response.status);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Error al guardar el cliente');
      }

      closeModal();
      fetchClientes(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminHeader />

      {/* ================= BANNER GIGANTE ================= */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>GESTIÓN DE <span className="text-red">CLIENTES</span></h1>
          <p>ADMINISTRACIÓN DE DIRECTORIO Y CONTACTOS</p>
        </div>
        <div className="hero-slash"></div>
      </div>

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-title-group">
            <Users size={24} color="#ef4444" />
            <h2 className="page-subtitle">DIRECTORIO DEL SISTEMA</h2>
          </div>
          
          <button className="btn-create-primary" onClick={openCreateModal}>
            <Plus size={16} strokeWidth={3} />
            <span>NUEVO CLIENTE</span>
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ================= BARRA DE CONTROLES (Buscador y Filtro) ================= */}
        <div className="controls-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar por nombre, cédula o correo..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="filter-wrapper">
            <Filter className="filter-icon" size={18} />
            <select 
              className="filter-select"
              value={sortOption}
              onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
            >
              <option value="recientes">Más Recientes</option>
              <option value="a-z">Nombre (A - Z)</option>
              <option value="z-a">Nombre (Z - A)</option>
            </select>
          </div>
        </div>

        {/* ================= TABLA DE CLIENTES ================= */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>IDENTIFICACIÓN</th>
                <th>NOMBRE</th>
                <th>TELÉFONO</th>
                <th>CORREO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray">Cargando...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray">No se encontraron clientes.</td></tr>
              ) : (
                currentItems.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="font-bold text-white">{cliente.identificacion || 'N/A'}</td>
                    <td className="font-bold text-white">{cliente.nombre || 'Sin Nombre'}</td>
                    <td>{cliente.telefono || '—'}</td>
                    <td className="text-gray">{cliente.email || '—'}</td>
                    <td>
                      <div className="action-buttons-group">
                        <button className="btn-icon btn-view-client" onClick={() => openClientDetail(cliente)} title="Ver detalle e historial">
                          <Eye size={18} color="#ef4444" />
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => openEditModal(cliente)} title="Editar">
                          <Edit size={18} color="#3b82f6" />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(cliente.id)} title="Eliminar">
                          <Trash2 size={18} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINACIÓN ================= */}
        {!loading && totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedClientes.length)} de {processedClientes.length}
            </span>
            <div className="pagination-controls">
              <button className="btn-page" onClick={prevPage} disabled={currentPage === 1}>
                <ChevronLeft size={18} />
              </button>
              <span className="page-indicator">Página {currentPage} de {totalPages}</span>
              <button className="btn-page" onClick={nextPage} disabled={currentPage === totalPages}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ================= MODAL DE CREACIÓN/EDICIÓN ================= */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h3>{editingCliente ? 'EDITAR CLIENTE' : 'CREAR CLIENTE'}</h3>
              <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="client-form-grid">
                <div className="client-form-field">
                  <label>TIPO DE IDENTIFICACIÓN</label>
                  <select required value={formData.id_tipo_identificacion} onChange={(e) => setFormData({...formData, id_tipo_identificacion: e.target.value})}>
                    {TIPOS_IDENTIFICACION.map(tipo => <option key={tipo.id} value={String(tipo.id)}>{tipo.nombre}</option>)}
                  </select>
                  <span className="client-field-status" aria-hidden="true"></span>
                </div>
                <div className="client-form-field">
                  <label>NÚMERO DE IDENTIFICACIÓN</label>
                  <input type="text" required value={formData.identificacion} onChange={(e) => setFormData({...formData, identificacion: e.target.value})} placeholder="Ej. 123456789" />
                  <span className="client-field-status" aria-hidden="true"></span>
                </div>
                <div className="client-form-field client-form-field-full">
                  <label>NOMBRE COMPLETO</label>
                  <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Juan Pérez" />
                </div>
                <div className="client-form-field">
                  <label>TELÉFONO</label>
                  <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} placeholder="Ej. +1 809-555-0000" />
                </div>
                <div className="client-form-field">
                  <label>CORREO ELECTRÓNICO</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="cliente@correo.com" />
                </div>
                <div className="client-form-field client-form-field-full">
                  <label>DIRECCIÓN</label>
                  <input type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} placeholder="Dirección del cliente" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>CANCELAR</button>
                <button type="submit" className="btn-confirm" disabled={formLoading || !formData.id_tipo_identificacion || !formData.identificacion.trim() || !formData.nombre.trim()}>
                  {formLoading ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCliente && (
        <div className="cxc-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeClientDetail()}>
          <section className="cxc-modal client-history-modal">
            <header className="client-history-header">
              <div><span>DETALLE DEL CLIENTE</span><h2>{selectedCliente.nombre}</h2></div>
              <button type="button" onClick={closeClientDetail} aria-label="Cerrar detalle"><X size={20} /></button>
            </header>
            {detailError && <div className="cxc-alert"><AlertCircle size={18} />{detailError}</div>}
            {detailLoading ? <div className="cxc-empty">Cargando información del cliente…</div> : <>
              <div className="cxc-detail-grid">
                <HistoryInfo label="Identificación" value={selectedCliente.identificacion} />
                <HistoryInfo label="Teléfono" value={selectedCliente.telefono} />
                <HistoryInfo label="Correo" value={selectedCliente.email} />
                <HistoryInfo label="Dirección" value={selectedCliente.direccion} />
                <HistoryInfo label="Fecha de registro" value={formatHistoryDate(selectedCliente.fecha_creacion)} />
                <HistoryInfo label="Estado" value={selectedCliente.estado ? 'Activo' : 'Inactivo'} />
              </div>
              <h3 className="client-history-modal-title"><Car size={19} color="#ef4444" /> VEHÍCULOS ASOCIADOS</h3>
              {!clientVehicles.length ? <div className="cxc-empty">Este cliente no tiene vehículos asociados.</div> : clientVehicles.map(vehicle => <VehicleHistory key={vehicle.id} vehicle={vehicle} getHeaders={getAuthHeaders} onAuthError={handleAuthError} />)}
            </>}
          </section>
        </div>
      )}
    </div>
  );
};

export default Gestion_Clientes;