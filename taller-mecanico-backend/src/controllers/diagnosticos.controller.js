const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/diagnosticos?id_vehiculo=
async function listar(req, res) {
  const { id_vehiculo } = req.query;
  
  const where = {
    estado: true,
    ...(id_vehiculo && { id_vehiculo: Number(id_vehiculo) })
  };

  const diagnosticos = await prisma.diagnostico.findMany({ 
    where, 
    orderBy: { fecha: 'desc' }
  });
  
  res.json(diagnosticos);
}

// POST /api/diagnosticos
async function crear(req, res) {
  const { id_vehiculo, presionBaja, presionAlta, temperatura, fallaDetectada } = req.body;

  if (!id_vehiculo) throw ApiError.badRequest('El id_vehiculo es requerido.');

  // Validar que el vehículo existe
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(id_vehiculo) } });
  if (!vehiculo || !vehiculo.estado) throw ApiError.badRequest('El vehículo indicado no existe o está inactivo.');

  // Crear el registro directamente sin depender de la OT
  const diagnostico = await prisma.diagnostico.create({
    data: {
      id_vehiculo: Number(id_vehiculo),
      presionBaja: presionBaja ?? null,
      presionAlta: presionAlta ?? null,
      temperatura: temperatura ?? null,
      fallaDetectada,
    },
  });

  res.status(201).json(diagnostico);
}

module.exports = { listar, crear };