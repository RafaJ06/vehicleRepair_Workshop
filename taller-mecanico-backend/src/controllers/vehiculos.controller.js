const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/vehiculos?clienteId=
async function listar(req, res) {
  const { clienteId } = req.query;
  const where = clienteId ? { clienteId: Number(clienteId) } : {};

  const vehiculos = await prisma.vehiculo.findMany({
    where,
    include: { cliente: { select: { id: true, nombre: true } } },
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
      cliente: true,
      ordenesTrabajo: {
        orderBy: { fecha: 'desc' },
        include: { diagnosticos: true, facturas: true },
      },
    },
  });
  if (!vehiculo) throw ApiError.notFound('Vehiculo no encontrado.');
  res.json(vehiculo);
}

// POST /api/vehiculos  - cada vehiculo debe pertenecer a un cliente (regla de negocio)
async function crear(req, res) {
  const { clienteId, chasis, marca, modelo, color, anio, placa } = req.body;

  const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } });
  if (!cliente) throw ApiError.badRequest('El cliente indicado no existe.');

  const vehiculo = await prisma.vehiculo.create({
    data: { clienteId: Number(clienteId), chasis, marca, modelo, color, anio: Number(anio), placa },
  });
  res.status(201).json(vehiculo);
}

// PUT /api/vehiculos/:id
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { chasis, marca, modelo, color, anio, placa } = req.body;

  const vehiculo = await prisma.vehiculo.update({
    where: { id },
    data: { chasis, marca, modelo, color, anio: anio ? Number(anio) : undefined, placa },
  });
  res.json(vehiculo);
}

// DELETE /api/vehiculos/:id
async function eliminar(req, res) {
  const id = Number(req.params.id);
  await prisma.vehiculo.delete({ where: { id } });
  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
