export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'HTTP_ERROR', data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const readResponse = async (response) => {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
};

const getErrorMessage = (response, data) => {
  if (response.status === 404) return 'Esta funcionalidad todavía no está disponible en el backend';
  if (response.status >= 500) return data?.message || data?.error || 'El servidor no pudo procesar la solicitud';
  return data?.message || data?.error || `La solicitud no pudo completarse (${response.status})`;
};

export const apiRequest = async (path, options = {}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;
  let body = options.body;

  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  if (body != null && !isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (body != null && !isFormData && typeof body !== 'string') body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, { ...options, headers, body });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('No fue posible conectar con el servidor', { code: 'NETWORK_ERROR' });
  }

  const data = await readResponse(response);
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (window.location.pathname !== '/') window.location.assign('/');
    throw new ApiError('Sesión expirada o permisos insuficientes.', { status: response.status, code: 'AUTH_ERROR', data });
  }
  if (!response.ok) {
    throw new ApiError(getErrorMessage(response, data), {
      status: response.status,
      code: response.status === 404 ? 'ENDPOINT_UNAVAILABLE' : response.status >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR',
      data,
    });
  }
  return data;
};

export const createSearchParams = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};