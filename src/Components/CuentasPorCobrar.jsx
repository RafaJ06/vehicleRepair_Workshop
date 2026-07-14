import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, Banknote, CheckCircle, CreditCard, Eye, FileText, History, Printer, Receipt, Search, X } from 'lucide-react';
import { AdminHeader } from './Header';
import { API_FEATURES } from '../config/apiFeactures';
import {
  listarCuentasPorCobrar,
  listarCuentasDesdeFacturas,
  obtenerCuentaPorCobrar,
  obtenerFacturaDetalle,
  obtenerOrdenTrabajoDetalle,
  toNumberSeguro,
} from '../services/cuentasPorCobrar.service';
import { listarPagos, normalizarPago, obtenerPago, registrarPago } from '../services/pagos.service';
import '../Style/CuentasPorCobrar.css';

const toArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
const formatAmount = (value) => new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(toNumberSeguro(value));
const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium' }).format(date);
};
const getRole = () => {
  try {
    const role = JSON.parse(localStorage.getItem('usuario') || '{}').rol;
    return String(typeof role === 'object' ? role?.nombre : role || '').toLowerCase();
  } catch { return ''; }
};
const getClient = (account) => account.cliente ?? account.factura?.clientes ?? account.factura?.cliente ?? null;
const isPaidAccount = (account) => {
  const status = String(account.estatus || '').toLowerCase();
  return account.montoPendiente <= 0 || status === 'cancelada' || status === 'pagada';
};
const normalizeAccountPayment = (entry) => {
  const master = entry.pagos_maestro ?? entry.pago_maestro ?? entry.pago ?? entry;
  const normalized = normalizarPago({ ...master, detalles: master.detalles ?? [entry] });
  return {
    ...normalized,
    amount: toNumberSeguro(entry.monto_abonado ?? entry.monto ?? entry.valor ?? normalized.totalRecibido),
    state: entry.estado ?? normalized.estado,
  };
};

const CuentasPorCobrar = () => {
  const location = useLocation();
  const requestedInvoiceId = new URLSearchParams(location.search).get('facturaId') || '';
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState(requestedInvoiceId);
  const [status, setStatus] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentAccount, setPaymentAccount] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [endpointNotice, setEndpointNotice] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyFilters, setHistoryFilters] = useState({ clienteId: '', fechaDesde: '', fechaHasta: '' });
  const [payments, setPayments] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const role = getRole();
  const allowed = ['administrador', 'admin', 'supervisor', 'recepcionista'].includes(role);

  const loadAccounts = useCallback(async () => {
    if (!allowed) { setLoading(false); return; }
    setLoading(true);
    setError('');
    setEndpointNotice('');
    try {
      if (API_FEATURES.cuentasPorCobrar) {
        try {
          const data = await listarCuentasPorCobrar(requestedInvoiceId ? { facturaId: requestedInvoiceId } : {});
          setAccounts(data);
        } catch (err) {
          if (err.code !== 'ENDPOINT_UNAVAILABLE') throw err;
          // Fallback temporal: retirar cuando el endpoint dedicado esté publicado.
          setAccounts(await listarCuentasDesdeFacturas());
          setEndpointNotice('El endpoint de Cuentas por Cobrar todavía no está disponible; se muestran datos reales obtenidos desde facturas.');
        }
      } else {
        setAccounts(await listarCuentasDesdeFacturas());
        setEndpointNotice('Cuentas por Cobrar usa temporalmente datos reales de facturas hasta habilitar el endpoint dedicado.');
      }
    } catch (err) {
      setAccounts([]);
      setError(err.code === 'NETWORK_ERROR' ? 'No fue posible conectar con el servidor' : err.message);
    } finally {
      setLoading(false);
    }
  }, [allowed, requestedInvoiceId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) loadAccounts(); });
    return () => { active = false; };
  }, [loadAccounts]);

  const statuses = useMemo(() => [...new Set(accounts.map(account => account.estatus).filter(Boolean))], [accounts]);
  const rows = useMemo(() => accounts.filter(account => {
    const client = getClient(account);
    const searchable = `${account.idFactura || ''} ${client?.nombre || ''} ${client?.identificacion || ''}`.toLowerCase();
    const matchesSearch = requestedInvoiceId && search === requestedInvoiceId
      ? String(account.idFactura) === requestedInvoiceId
      : searchable.includes(search.trim().toLowerCase());
    return matchesSearch
      && (!status || account.estatus === status)
      && (!pendingOnly || account.montoPendiente > 0);
  }), [accounts, pendingOnly, requestedInvoiceId, search, status]);
  const totals = useMemo(() => accounts.reduce((sum, account) => ({
    total: sum.total + account.montoTotal,
    paid: sum.paid + account.montoPagado,
    pending: sum.pending + account.montoPendiente,
  }), { total: 0, paid: 0, pending: 0 }), [accounts]);

  const getDetailedInvoice = async (account) => {
    let detailedAccount = account;
    if (API_FEATURES.cuentasPorCobrar && account.idCxc) {
      try {
        detailedAccount = await obtenerCuentaPorCobrar(account.idCxc);
      } catch (err) {
        if (err.code !== 'ENDPOINT_UNAVAILABLE') throw err;
        setEndpointNotice('El detalle dedicado de la cuenta todavía no está disponible; se conserva el detalle real de factura.');
      }
    }
    let invoice = detailedAccount.factura ?? account.factura;
    if (detailedAccount.idFactura ?? account.idFactura) {
      invoice = await obtenerFacturaDetalle(detailedAccount.idFactura ?? account.idFactura);
    }
    let orderDetail = null;
    if (invoice?.ordenTrabajo?.id) {
      try { orderDetail = await obtenerOrdenTrabajoDetalle(invoice.ordenTrabajo.id); } catch { orderDetail = null; }
    }
    return { account: { ...account, ...detailedAccount, factura: invoice }, invoice: { ...invoice, orderDetail } };
  };

  const openDetail = async (account) => {
    setDetailLoading(true);
    setError('');
    try {
      const detail = await getDetailedInvoice(account);
      setSelectedAccount(detail.account);
      setSelectedInvoice(detail.invoice);
    } catch (err) {
      setError(err.code === 'NETWORK_ERROR' ? 'No fue posible conectar con el servidor' : err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const printInvoice = async (account) => {
    setDetailLoading(true);
    setError('');
    try {
      const detail = await getDetailedInvoice(account);
      setSelectedAccount(detail.account);
      setSelectedInvoice(detail.invoice);
      window.setTimeout(() => window.print(), 150);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePaymentSuccess = async (account) => {
    const reopenDetail = selectedAccount?.idCxc === account.idCxc;
    setPaymentAccount(null);
    setSuccessMessage('Pago registrado correctamente. Los saldos fueron actualizados por el backend.');
    await loadAccounts();
    if (reopenDetail) await openDetail(account);
  };

  const loadPaymentHistory = async (filters = historyFilters) => {
    setHistoryOpen(true);
    setHistoryError('');
    setPayments([]);
    if (!API_FEATURES.historialPagos) {
      setHistoryError('El historial de pagos estará disponible cuando el servicio de pagos sea habilitado');
      return;
    }
    setHistoryLoading(true);
    try {
      setPayments(await listarPagos(filters));
    } catch (err) {
      setHistoryError(err.code === 'NETWORK_ERROR' ? 'No fue posible conectar con el servidor' : err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openReceipt = async (payment) => {
    if (!API_FEATURES.historialPagos) return;
    setHistoryLoading(true);
    setHistoryError('');
    try { setReceipt(await obtenerPago(payment.id)); }
    catch (err) { setHistoryError(err.message); }
    finally { setHistoryLoading(false); }
  };

  return (
    <div className="dashboard-container">
      <AdminHeader />
      <div className="cxc-hero"><div><h1>CUENTAS POR <span>COBRAR</span></h1><p>CONTROL DE FACTURAS Y SALDOS PENDIENTES</p></div></div>
      <main className="cxc-main">
        <div className="cxc-title">
          <Banknote size={24} />
          <div><h2>CARTERA DE CUENTAS</h2><p>Consulta financiera basada exclusivamente en información del backend.</p></div>
          <button className="cxc-secondary-action" onClick={() => loadPaymentHistory()}><History size={16} /> HISTORIAL DE PAGOS</button>
        </div>
        {!allowed ? <div className="cxc-alert"><AlertCircle size={18} />Tu rol no tiene acceso al módulo de Cuentas por Cobrar.</div> : <>
          <div className="cxc-summary">
            <Summary label="TOTAL FACTURADO" value={loading || error || !accounts.length ? '—' : formatAmount(totals.total)} />
            <Summary label="TOTAL PAGADO" value={loading || error || !accounts.length ? '—' : formatAmount(totals.paid)} />
            <Summary label="SALDO PENDIENTE" value={loading || error || !accounts.length ? '—' : formatAmount(totals.pending)} accent />
          </div>
          {endpointNotice && <div className="cxc-service-notice"><AlertCircle size={17} />{endpointNotice}</div>}
          {successMessage && <div className="cxc-success"><CheckCircle size={17} />{successMessage}</div>}
          <div className="cxc-filters">
            <div className="cxc-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar cliente, identificación o factura" /></div>
            <select value={status} onChange={event => setStatus(event.target.value)}><option value="">Todos los estatus</option>{statuses.map(item => <option key={item} value={item}>{item}</option>)}</select>
            <label><input type="checkbox" checked={pendingOnly} onChange={event => setPendingOnly(event.target.checked)} /> SOLO PENDIENTES</label>
          </div>
          {error && <div className="cxc-alert"><AlertCircle size={18} />{error}</div>}
          {loading ? <Empty text="Cargando cuentas…" /> : error ? null : !accounts.length ? <Empty text="No se encontraron registros" /> : !rows.length ? <Empty text="No hay cuentas que coincidan con los filtros." /> : (
            <div className="cxc-table-wrap"><table className="cxc-table">
              <thead><tr><th>FACTURA</th><th>CLIENTE</th><th>FECHA</th><th>TOTAL</th><th>PAGADO</th><th>PENDIENTE</th><th>ESTATUS</th><th>ACCIONES</th></tr></thead>
              <tbody>{rows.map((account, index) => {
                const client = getClient(account);
                const invoice = account.factura;
                return <tr className={String(account.idFactura) === requestedInvoiceId ? 'cxc-row-highlight' : ''} key={account.idCxc ?? `${account.idFactura}-${index}`}>
                  <td className="cxc-red">FAC-{account.idFactura}</td><td><strong>{client?.nombre || 'Sin cliente'}</strong><small>{client?.identificacion || '—'}</small></td><td>{formatDate(invoice?.fecha)}</td>
                  <td>{formatAmount(account.montoTotal)}</td><td>{formatAmount(account.montoPagado)}</td><td className="cxc-red">{formatAmount(account.montoPendiente)}</td><td><span className={`cxc-status ${String(account.estatus || '').toLowerCase()}`}>{account.estatus}</span></td>
                  <td><div className="cxc-actions"><button className="cxc-detail-btn" onClick={() => openDetail(account)}><Eye size={16} /> VER DETALLE</button><button className="cxc-detail-btn" onClick={() => printInvoice(account)}><Printer size={16} /> IMPRIMIR</button><button className="cxc-detail-btn" disabled={isPaidAccount(account)} onClick={() => setPaymentAccount(account)} title={isPaidAccount(account) ? 'La cuenta no tiene saldo pendiente.' : 'Abrir formulario de pago'}><CreditCard size={16} /> REGISTRAR PAGO</button></div></td>
                </tr>;
              })}</tbody>
            </table></div>
          )}
          {detailLoading && <div className="cxc-modal-backdrop"><Empty text="Cargando información…" /></div>}
          {selectedInvoice && !detailLoading && <InvoiceModal invoice={selectedInvoice} account={selectedAccount} close={() => { setSelectedInvoice(null); setSelectedAccount(null); }} onPayment={() => setPaymentAccount(selectedAccount)} />}
          {paymentAccount && <PaymentModal account={paymentAccount} close={() => setPaymentAccount(null)} onSuccess={() => handlePaymentSuccess(paymentAccount)} />}
          {historyOpen && <PaymentHistoryModal payments={payments} loading={historyLoading} error={historyError} filters={historyFilters} setFilters={setHistoryFilters} search={() => loadPaymentHistory(historyFilters)} close={() => { setHistoryOpen(false); setReceipt(null); }} openReceipt={openReceipt} />}
          {receipt && <PaymentReceiptModal payment={receipt} close={() => setReceipt(null)} />}
        </>}
      </main>
    </div>
  );
};

const Summary = ({ label, value, accent }) => <div className={`cxc-summary-card ${accent ? 'accent' : ''}`}><span>{label}</span><strong>{value}</strong></div>;
const Empty = ({ text }) => <div className="cxc-empty">{text}</div>;
const Info = ({ label, value }) => <div className="cxc-info"><span>{label}</span><strong>{value ?? '—'}</strong></div>;

const InvoiceModal = ({ invoice, account, close, onPayment }) => {
  const client = account?.cliente ?? invoice.clientes ?? invoice.cliente;
  const payments = toArray(account?.pagos).map(normalizeAccountPayment);
  return <div className="cxc-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}><section className="cxc-modal">
    <header><div><span>DETALLE DE CUENTA</span><h2>FAC-{account?.idFactura ?? invoice.id}</h2></div><div className="cxc-modal-actions"><button className="cxc-detail-btn" onClick={() => window.print()}><Printer size={16} /> IMPRIMIR FACTURA</button><button className="cxc-detail-btn" disabled={isPaidAccount(account)} onClick={onPayment}><CreditCard size={16} /> REGISTRAR PAGO</button><button onClick={close} aria-label="Cerrar"><X /></button></div></header>
    <div className="cxc-detail-grid"><Info label="Cuenta" value={account?.idCxc ? `CXC-${account.idCxc}` : 'No disponible'} /><Info label="Cliente" value={client?.nombre} /><Info label="Identificación" value={client?.identificacion} /><Info label="Fecha" value={formatDate(invoice.fecha)} /><Info label="Orden" value={invoice.ordenTrabajo ? `OT-${invoice.ordenTrabajo.id}` : '—'} /><Info label="Monto total" value={formatAmount(account?.montoTotal ?? invoice.total)} /><Info label="Monto pagado" value={formatAmount(account?.montoPagado)} /><Info label="Monto pendiente" value={formatAmount(account?.montoPendiente)} /><Info label="Estatus" value={account?.estatus ?? invoice.estatus} /></div>
    <h3><FileText size={18} /> DETALLES DE FACTURA</h3>
    {!invoice.factura_detalles?.length ? <Empty text="Sin detalles registrados." /> : <div className="cxc-table-wrap"><table className="cxc-table"><thead><tr><th>CONCEPTO</th><th>CANTIDAD</th><th>PRECIO</th><th>IMPUESTO</th><th>SUBTOTAL</th></tr></thead><tbody>{invoice.factura_detalles.map(item => <tr key={item.id_detalle}><td>{item.materiales_repuestos?.nombre || 'Servicio'}</td><td>{item.cantidad}</td><td>{formatAmount(item.precio_unitario)}</td><td>{formatAmount(item.valor_impuesto)}</td><td>{formatAmount(item.subtotal_item)}</td></tr>)}</tbody></table></div>}
    <h3><History size={18} /> HISTORIAL DE ABONOS</h3>
    {!API_FEATURES.historialPagos ? <div className="cxc-service-notice">El historial de pagos estará disponible cuando el servicio de pagos sea habilitado</div> : !payments.length ? <Empty text="No se encontraron registros" /> : <PaymentTable payments={payments} />}
    <InvoicePrint invoice={invoice} account={account} />
  </section></div>;
};

const PaymentModal = ({ account, close, onSuccess }) => {
  const client = getClient(account);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const available = API_FEATURES.pagos;
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!available) { setError('El servicio para registrar pagos aún no está disponible'); return; }
    const numericAmount = toNumberSeguro(amount, null);
    if (numericAmount == null || numericAmount <= 0) { setError('El monto debe ser mayor que 0.'); return; }
    if (numericAmount > account.montoPendiente) { setError('El monto no puede superar el saldo pendiente.'); return; }
    if (isPaidAccount(account)) { setError('Esta cuenta no admite nuevos pagos.'); return; }
    if (!client?.id) { setError('La cuenta no incluye el cliente requerido para registrar el pago.'); return; }
    if (!window.confirm(`¿Registrar un pago de ${formatAmount(numericAmount)} para FAC-${account.idFactura}?`)) return;
    setSubmitting(true);
    try {
      await registrarPago({ id_cliente: client.id, forma_pago: paymentMethod, monto_total_recibido: numericAmount, detalles: [{ id_cxc: account.idCxc, monto_abonado: numericAmount }] });
      await onSuccess();
    } catch (err) {
      setError(err.code === 'ENDPOINT_UNAVAILABLE' ? 'El servicio para registrar pagos aún no está disponible' : err.message);
    } finally { setSubmitting(false); }
  };
  return <div className="cxc-modal-backdrop cxc-payment-layer" onMouseDown={event => event.target === event.currentTarget && close()}><section className="cxc-modal cxc-payment-modal"><header><div><span>REGISTRAR PAGO</span><h2>FAC-{account.idFactura}</h2></div><button onClick={close} aria-label="Cerrar"><X /></button></header>
    <div className="cxc-detail-grid"><Info label="Cliente" value={client?.nombre} /><Info label="Monto total" value={formatAmount(account.montoTotal)} /><Info label="Monto pagado" value={formatAmount(account.montoPagado)} /><Info label="Saldo pendiente" value={formatAmount(account.montoPendiente)} /></div>
    {!available && <div className="cxc-service-notice"><AlertCircle size={17} />El servicio para registrar pagos aún no está disponible</div>}{error && <div className="cxc-alert"><AlertCircle size={17} />{error}</div>}
    <form className="cxc-payment-form" onSubmit={submit}><label>MONTO A ABONAR<input type="number" min="0.01" step="0.01" max={account.montoPendiente} required value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.00" /></label><label>FORMA DE PAGO<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)}><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option><option>Cheque</option></select></label><div className="cxc-form-actions"><button type="button" onClick={close}>CANCELAR</button><button type="submit" disabled={!available || submitting || isPaidAccount(account)}>{submitting ? 'PROCESANDO…' : 'CONFIRMAR PAGO'}</button></div></form>
  </section></div>;
};

const PaymentHistoryModal = ({ payments, loading, error, filters, setFilters, search, close, openReceipt }) => <div className="cxc-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}><section className="cxc-modal cxc-history-modal"><header><div><span>CONSULTA GENERAL</span><h2>HISTORIAL DE PAGOS</h2></div><button onClick={close} aria-label="Cerrar"><X /></button></header>
  <div className="cxc-history-filters"><label>CLIENTE ID<input value={filters.clienteId} onChange={event => setFilters({ ...filters, clienteId: event.target.value })} /></label><label>DESDE<input type="date" value={filters.fechaDesde} onChange={event => setFilters({ ...filters, fechaDesde: event.target.value })} /></label><label>HASTA<input type="date" value={filters.fechaHasta} onChange={event => setFilters({ ...filters, fechaHasta: event.target.value })} /></label><button disabled={!API_FEATURES.historialPagos || loading} onClick={search}><Search size={16} /> BUSCAR</button></div>
  {error && <div className={API_FEATURES.historialPagos ? 'cxc-alert' : 'cxc-service-notice'}><AlertCircle size={17} />{error}</div>}
  {loading ? <Empty text="Cargando pagos…" /> : !payments.length ? <Empty text={API_FEATURES.historialPagos ? 'No se encontraron registros' : 'Funcionalidad pendiente de habilitación'} /> : <PaymentTable payments={payments} openReceipt={openReceipt} />}
  {!API_FEATURES.historialPagos && <button className="cxc-receipt-disabled" disabled title="GET /api/pagos/:id todavía no está habilitado"><Receipt size={16} /> IMPRIMIR RECIBO</button>}
</section></div>;

const PaymentTable = ({ payments, openReceipt }) => <div className="cxc-table-wrap"><table className="cxc-table"><thead><tr><th>PAGO</th><th>FECHA</th><th>FORMA</th><th>CLIENTE</th><th>MONTO</th><th>ESTADO</th>{openReceipt && <th>ACCIÓN</th>}</tr></thead><tbody>{payments.map((payment, index) => <tr key={payment.id ?? index}><td>PG-{payment.id ?? '—'}</td><td>{formatDate(payment.fecha)}</td><td>{payment.formaPago}</td><td>{payment.cliente?.nombre || 'No disponible'}</td><td>{formatAmount(payment.amount ?? payment.totalRecibido)}</td><td>{payment.state ?? payment.estado}</td>{openReceipt && <td><button className="cxc-detail-btn" onClick={() => openReceipt(payment)}><Receipt size={15} /> VER RECIBO</button></td>}</tr>)}</tbody></table></div>;

const PaymentReceiptModal = ({ payment, close }) => <div className="cxc-modal-backdrop cxc-receipt-layer" onMouseDown={event => event.target === event.currentTarget && close()}><section className="cxc-modal"><header><div><span>DETALLE DE PAGO</span><h2>RECIBO PG-{payment.id}</h2></div><div className="cxc-modal-actions"><button className="cxc-detail-btn" onClick={() => window.print()}><Printer size={16} /> IMPRIMIR RECIBO</button><button onClick={close} aria-label="Cerrar"><X /></button></div></header>
  <div className="cxc-detail-grid"><Info label="Cliente" value={payment.cliente?.nombre} /><Info label="Identificación" value={payment.cliente?.identificacion} /><Info label="Fecha" value={formatDate(payment.fecha)} /><Info label="Forma de pago" value={payment.formaPago} /><Info label="Total recibido" value={formatAmount(payment.totalRecibido)} /><Info label="Estado" value={payment.estado} /></div>
  {!payment.detalles.length ? <Empty text="No se encontraron detalles aplicados." /> : <div className="cxc-table-wrap"><table className="cxc-table"><thead><tr><th>CUENTA</th><th>FACTURA</th><th>MONTO APLICADO</th></tr></thead><tbody>{payment.detalles.map((detail, index) => <tr key={detail.idDetalle ?? index}><td>CXC-{detail.idCxc ?? '—'}</td><td>FAC-{detail.idFactura ?? '—'}</td><td>{formatAmount(detail.montoAbonado)}</td></tr>)}</tbody></table></div>}
  <PaymentReceiptPrint payment={payment} />
</section></div>;

const PaymentReceiptPrint = ({ payment }) => <article className="payment-receipt-print"><header><div><strong>TALLER MECÁNICO</strong><span>RECIBO DE PAGO</span></div><div><b>PG-{payment.id}</b><span>{formatDate(payment.fecha)}</span></div></header><section><div><span>CLIENTE</span><strong>{payment.cliente?.nombre || 'No disponible'}</strong><small>{payment.cliente?.identificacion || 'Identificación no disponible'}</small></div><div><span>FORMA DE PAGO</span><strong>{payment.formaPago}</strong></div><div><span>TOTAL RECIBIDO</span><strong>{formatAmount(payment.totalRecibido)}</strong></div></section><table><thead><tr><th>CUENTA</th><th>FACTURA</th><th>MONTO APLICADO</th></tr></thead><tbody>{payment.detalles.map((detail, index) => <tr key={detail.idDetalle ?? index}><td>CXC-{detail.idCxc ?? '—'}</td><td>FAC-{detail.idFactura ?? '—'}</td><td>{formatAmount(detail.montoAbonado)}</td></tr>)}</tbody></table><footer>TOTAL APLICADO: {formatAmount(payment.detalles.reduce((sum, detail) => sum + detail.montoAbonado, 0))}</footer></article>;

const InvoicePrint = ({ invoice, account }) => {
  const client = account?.cliente ?? invoice.clientes ?? invoice.cliente;
  const order = invoice.orderDetail ?? invoice.ordenTrabajo;
  const diagnostics = toArray(invoice.factura_diagnostico_puente).map(item => item.diagnosticos).filter(Boolean);
  const diagnostic = diagnostics[0] ?? order?.diagnosticos;
  const vehicle = diagnostic?.vehiculos;
  return <article className="invoice-print-area"><header className="invoice-print-header"><div><strong>TALLER MECÁNICO</strong><span>FACTURA</span></div><div><b>FAC-{account?.idFactura ?? invoice.id}</b><span>{formatDate(invoice.fecha)}</span></div></header><section className="invoice-print-meta"><div><span>CLIENTE</span><strong>{client?.nombre || 'No disponible'}</strong><small>{client?.identificacion || 'Identificación no disponible'}</small></div><div><span>ORDEN / VEHÍCULO</span><strong>{order?.id ? `OT-${order.id}` : 'Orden no disponible'}</strong><small>{vehicle ? `${vehicle.placa || 'Sin placa'} · ${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim() : 'Vehículo no disponible'}</small></div><div><span>DIAGNÓSTICO</span><strong>{diagnostic?.id ? `DG-${diagnostic.id}` : 'No disponible'}</strong><small>{diagnostic?.falla_detectada || 'Falla no disponible'}</small></div></section><table className="invoice-print-table"><thead><tr><th>CONCEPTO</th><th>CANT.</th><th>PRECIO</th><th>IMPUESTO</th><th>SUBTOTAL</th></tr></thead><tbody>{invoice.factura_detalles?.length ? invoice.factura_detalles.map(item => <tr key={item.id_detalle}><td>{item.materiales_repuestos?.nombre || 'Servicio'}</td><td>{item.cantidad}</td><td>{formatAmount(item.precio_unitario)}</td><td>{formatAmount(item.valor_impuesto)}</td><td>{formatAmount(item.subtotal_item)}</td></tr>) : <tr><td colSpan="5">Sin detalles registrados.</td></tr>}</tbody></table><section className="invoice-print-totals"><div><span>Subtotal</span><strong>{formatAmount(invoice.subtotal)}</strong></div><div><span>Impuestos</span><strong>{formatAmount(invoice.total_impuestos)}</strong></div><div className="total"><span>Total</span><strong>{formatAmount(account?.montoTotal ?? invoice.total)}</strong></div>{account && <><div><span>Pagado</span><strong>{formatAmount(account.montoPagado)}</strong></div><div><span>Pendiente</span><strong>{formatAmount(account.montoPendiente)}</strong></div></>}</section><footer>Estatus: {account?.estatus || invoice.estatus || 'No disponible'}</footer></article>;
};

export default CuentasPorCobrar;