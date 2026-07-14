import { apiRequest } from './apiClient';

const getCollection = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.tipos)) return response.tipos;
  return [];
};

export const normalizarTipoIdentificacion = (tipo) => ({
  id: tipo?.id_tipo_identificacion ?? tipo?.id ?? null,
  nombre: tipo?.nombre ?? tipo?.descripcion ?? '',
  estado: tipo?.estado !== false,
});

export const listarTiposIdentificacion = async () => {
  const response = await apiRequest('/api/tipos-identificacion');
  return getCollection(response)
    .map(normalizarTipoIdentificacion)
    .filter(tipo => tipo.estado && tipo.id != null && tipo.nombre);
};