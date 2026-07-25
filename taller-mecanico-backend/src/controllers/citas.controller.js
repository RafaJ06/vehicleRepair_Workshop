const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const include = {
  cliente: { select: { id: true, nombre: true } },
  vehiculo: { select: { id: true, marca: true, modelo: true, placa: true } },
};

// GET /api/citas?desde=&hasta=
async function listar(req, res) {
  const { desde, hasta } = req.query;
  const where = {
    ...(desde || hasta
      ? {
          fechaHora: {
            ...(desde && { gte: new Date(desde) }),
            ...(hasta && { lte: new Date(hasta) }),
          },
        }
      : {}),
  };

  const citas = await prisma.cita.findMany({ where, include, orderBy: { fechaHora: 'asc' } });
  res.json(citas);
}

// POST /api/citas
async function crear(req, res) {
  const { clienteId, vehiculoId, fechaHora, motivo } = req.body;
  const cita = await prisma.cita.create({
    data: {
      clienteId: Number(clienteId),
      vehiculoId: vehiculoId ? Number(vehiculoId) : null,
      fechaHora: new Date(fechaHora),
      motivo,
    },
    include,
  });
  res.status(201).json(cita);
}

// PUT /api/citas/:id  (modificar)
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { fechaHora, motivo, estado } = req.body;

  const cita = await prisma.cita.update({
    where: { id },
    data: { fechaHora: fechaHora ? new Date(fechaHora) : undefined, motivo, estado },
    include,
  });
  res.json(cita);
}

// PATCH /api/citas/:id/cancelar
async function cancelar(req, res) {
  const id = Number(req.params.id);
  const existente = await prisma.cita.findUnique({ where: { id } });
  if (!existente) throw ApiError.notFound('Cita no encontrada.');

  const cita = await prisma.cita.update({ where: { id }, data: { estado: 'CANCELADA' }, include });
  res.json(cita);
}

module.exports = { listar, crear, actualizar, cancelar };
