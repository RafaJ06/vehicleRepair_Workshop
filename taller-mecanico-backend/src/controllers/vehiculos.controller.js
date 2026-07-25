const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/vehiculos?clienteId=
async function listar(req, res) {
  const { clienteId } = req.query;

  // Filtrar por estado true (borrado lógico) y por cliente a través de la tabla intermedia si se proporciona
  const where = {
    estado: true,
    ...(clienteId && {
      clientes_vehiculos: {
        some: { id_cliente: Number(clienteId) },
      },
    }),
  };

  const vehiculos = await prisma.vehiculo.findMany({
    where,
    include: {
      clientes_vehiculos: {
        include: {
          clientes: { select: { id: true, nombre: true } },
        },
      },
    },
    orderBy: { id: 'desc' },
  });
  
  res.json(vehiculos);
}

// GET /api/vehiculos/:id  (incluye historial de OTs -> RF-10)
async function obtener(req, res) {
  const id = Number(req.params.id);
  
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id },
    include: {
      clientes_vehiculos: {
        include: { clientes: true },
      },
      // RF-10: Llegamos a las OTs a través de los diagnósticos del vehículo
      diagnosticos: {
        orderBy: { fecha: 'desc' },
        include: {
          ordenes_trabajo: {
            include: { facturas: true },
          },
        },
      },
    },
  });

  if (!vehiculo || !vehiculo.estado) throw ApiError.notFound('Vehículo no encontrado.');
  
  res.json(vehiculo);
}

// POST /api/vehiculos  - cada vehiculo debe pertenecer a un cliente (regla de negocio)
async function crear(req, res) {
  const { clienteId, chasis, marca, modelo, color, anio, placa } = req.body;

  if (!clienteId) throw ApiError.badRequest('Se requiere el ID del cliente para registrar el vehículo.');

  const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } });
  if (!cliente || !cliente.estado) throw ApiError.badRequest('El cliente indicado no existe o está inactivo.');

  // Validar unicidad para evitar que la app colapse por errores de base de datos
  const existente = await prisma.vehiculo.findFirst({
    where: { OR: [{ chasis }, { placa }] }
  });
  if (existente) throw ApiError.badRequest('El chasis o la placa ya están registrados en el sistema.');

  // Crea el vehículo y su relación en clientes_vehiculos en una sola transacción
  const vehiculo = await prisma.vehiculo.create({
    data: {
      chasis,
      marca,
      modelo,
      color,
      anio: anio ? Number(anio) : null,
      placa,
      clientes_vehiculos: {
        create: {
          id_cliente: Number(clienteId),
        },
      },
    },
  });
  
  res.status(201).json(vehiculo);
}

// PUT /api/vehiculos/:id
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { chasis, marca, modelo, color, anio, placa } = req.body;

  const existe = await prisma.vehiculo.findUnique({ where: { id } });
  if (!existe || !existe.estado) throw ApiError.notFound('Vehículo no encontrado.');

  const vehiculo = await prisma.vehiculo.update({
    where: { id },
    data: { 
      chasis, 
      marca, 
      modelo, 
      color, 
      anio: anio ? Number(anio) : null, 
      placa 
    },
  });
  
  res.json(vehiculo);
}

// DELETE /api/vehiculos/:id
async function eliminar(req, res) {
  const id = Number(req.params.id);
  
  const existe = await prisma.vehiculo.findUnique({ where: { id } });
  if (!existe || !existe.estado) throw ApiError.notFound('Vehículo no encontrado.');

  // Borrado lógico: Mantiene la integridad de facturas pasadas
  await prisma.vehiculo.update({ 
    where: { id },
    data: { estado: false }
  });
  
  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };