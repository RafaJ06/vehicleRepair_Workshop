import { apiRequest, createSearchParams } from './apiClient';

const toArray = (value) => Array.isArray(value) ? value : value ? [value] : [];

export const toNumberSeguro = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const normalized = String(value).trim().replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizarCuentaPorCobrar = (account = {}) => {
  const factura = account.factura ?? account.facturas ?? account.Factura ?? null;
  const cliente = account.cliente ?? account.clientes ?? factura?.cliente ?? factura?.clientes ?? null;
  return {
    idCxc: account.id_cxc ?? account.idCxc ?? account.id ?? null,
    idFactura: account.id_factura ?? account.idFactura ?? factura?.id ?? null,
    montoTotal: toNumberSeguro(account.monto_total ?? account.montoTotal),
    montoPagado: toNumberSeguro(account.monto_pagado ?? account.montoPagado),
    montoPendiente: toNumberSeguro(account.monto_pendiente ?? account.montoPendiente),
    estatus: account.estatus ?? account.status ?? 'Sin estatus',
    estado: account.estado !== false,
    factura,
    cliente,
    pagos: toArray(account.pagos ?? account.pagos_detalle ?? account.detalles_pago),
    raw: account,
  };
};

const getAccounts = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.cuentas)) return response.cuentas;
  if (response && typeof response === 'object' && (response.id_cxc ?? response.idCxc ?? response.id)) return [response];
  return [];
};

export const listarCuentasPorCobrar = async (filters = {}) => {
  const response = await apiRequest(`/api/cuentas-por-cobrar${createSearchParams(filters)}`);
  const accounts = getAccounts(response).map(normalizarCuentaPorCobrar).filter(account => account.estado);
  return Promise.all(accounts.map(async account => {
    if (account.factura || !account.idFactura) return account;
    try {
      const invoice = await apiRequest(`/api/facturas/${account.idFactura}`);
      return { ...account, factura: invoice, cliente: invoice?.clientes ?? invoice?.cliente ?? account.cliente };
    } catch {
      return account;
    }
  }));
};

export const obtenerCuentaPorCobrar = async (id) => {
  const response = await apiRequest(`/api/cuentas-por-cobrar/${id}`);
  const account = Array.isArray(response?.data) ? response.data[0] : response?.data ?? response?.cuenta ?? response;
  return normalizarCuentaPorCobrar(account);
};

export const obtenerFacturaDetalle = (id) => apiRequest(`/api/facturas/${id}`);
export const obtenerOrdenTrabajoDetalle = (id) => apiRequest(`/api/ordenes-trabajo/${id}`);

// Fallback temporal: retirar cuando GET /api/cuentas-por-cobrar esté habilitado.
export const listarCuentasDesdeFacturas = async () => {
  const limit = 100;
  const first = await apiRequest(`/api/facturas?page=1&limit=${limit}`);
  const firstPage = Array.isArray(first) ? first : first?.data || [];
  const pages = Math.ceil(Number(first?.total ?? firstPage.length) / limit);
  const rest = pages > 1
    ? await Promise.all(Array.from({ length: pages - 1 }, (_, index) => apiRequest(`/api/facturas?page=${index + 2}&limit=${limit}`)))
    : [];
  const invoices = firstPage.concat(rest.flatMap(item => Array.isArray(item) ? item : item?.data || []));
  return invoices.flatMap(factura =>
    toArray(factura.cuentas_por_cobrar ?? factura.cuentasPorCobrar)
      .map(account => normalizarCuentaPorCobrar({
        ...account,
        id_factura: account.id_factura ?? factura.id,
        factura,
        cliente: factura.clientes ?? factura.cliente,
      })),
  ).filter(account => account.estado);
};
