import { apiRequest, createSearchParams } from './apiClient';
import { toNumberSeguro } from './cuentasPorCobrar.service';

const toArray = (value) => Array.isArray(value) ? value : value ? [value] : [];

export const normalizarPago = (payment = {}) => {
  const details = toArray(payment.detalles ?? payment.pagos_detalle ?? payment.detalles_pago).map(detail => ({
    idDetalle: detail.id_detalle ?? detail.id_pago_detalle ?? detail.id ?? null,
    idCxc: detail.id_cxc ?? detail.idCxc ?? detail.cuenta_por_cobrar?.id_cxc ?? null,
    idFactura: detail.id_factura ?? detail.idFactura ?? detail.cuenta_por_cobrar?.id_factura ?? detail.factura?.id ?? null,
    montoAbonado: toNumberSeguro(detail.monto_abonado ?? detail.monto ?? detail.valor),
    cuenta: detail.cuenta_por_cobrar ?? detail.cuenta ?? null,
    factura: detail.factura ?? detail.cuenta_por_cobrar?.factura ?? null,
  }));
  return {
    id: payment.id_pago ?? payment.idPago ?? payment.id ?? null,
    fecha: payment.fecha ?? payment.fecha_pago ?? payment.fecha_creacion ?? null,
    formaPago: payment.forma_pago ?? payment.formaPago ?? 'No disponible',
    totalRecibido: toNumberSeguro(payment.monto_total_recibido ?? payment.total_recibido ?? payment.monto_total ?? payment.total),
    estado: payment.estado ?? payment.estatus ?? 'Sin estatus',
    cliente: payment.cliente ?? payment.clientes ?? null,
    detalles: details,
    raw: payment,
  };
};

const getPayments = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.pagos)) return response.pagos;
  return [];
};

export const registrarPago = async (payload) => {
  const response = await apiRequest('/api/pagos', { method: 'POST', body: payload });
  const payment = response?.pago ?? response?.data?.pago ?? response?.data ?? response;
  return { ...response, pagoNormalizado: normalizarPago(payment) };
};

export const listarPagos = async (filters = {}) => {
  const response = await apiRequest(`/api/pagos${createSearchParams(filters)}`);
  return getPayments(response).map(normalizarPago);
};

export const obtenerPago = async (id) => {
  const response = await apiRequest(`/api/pagos/${id}`);
  return normalizarPago(response?.data ?? response?.pago ?? response);
};

