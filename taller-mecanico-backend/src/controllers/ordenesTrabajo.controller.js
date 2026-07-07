const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const include = {
  cliente: { select: { id: true, nombre: true } },
  vehiculo: { select: { id: true, marca: true, modelo: true, placa: true } },
  mecanico: { select: { id: true, nombre: true } },
  diagnosticos: true,
  facturas: true,
};

// GET /api/ordenes-trabajo?estado=&clienteId=&vehiculoId=&mecanicoId=
async function listar(req, res) {
  const { estado, clienteId, vehiculoId, mecanicoId } = req.query;
  const where = {
    ...(estado && { estado }),
    ...(clienteId && { clienteId: Number(clienteId) }),
    ...(vehiculoId && { vehiculoId: Number(vehiculoId) }),
    ...(mecanicoId && { mecanicoId: Number(mecanicoId) }),
  };

  const ordenes = await prisma.ordenTrabajo.findMany({ where, include, orderBy: { fecha: 'desc' } });
  res.json(ordenes);
}

// GET /api/ordenes-trabajo/:id
async function obtener(req, res) {
  const id = Number(req.params.id);
  const orden = await prisma.ordenTrabajo.findUnique({ where: { id }, include });
  if (!orden) throw ApiError.notFound('Orden de trabajo no encontrada.');
  res.json(orden);
}

// POST /api/ordenes-trabajo  -> CU-01 Crear Orden de Trabajo
async function crear(req, res) {
  const { clienteId, vehiculoId, mecanicoId, sucursalId, problemaReportado } = req.body;

  const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(vehiculoId) } });
  if (!vehiculo) throw ApiError.badRequest('El vehiculo indicado no existe.');
  if (vehiculo.clienteId !== Number(clienteId)) {
    throw ApiError.badRequest('El vehiculo no pertenece al cliente indicado.');
  }

  const orden = await prisma.ordenTrabajo.create({
    data: {
      clienteId: Number(clienteId),
      vehiculoId: Number(vehiculoId),
      mecanicoId: mecanicoId ? Number(mecanicoId) : null,
      sucursalId: sucursalId ? Number(sucursalId) : null,
      problemaReportado,
    },
    include,
  });
  res.status(201).json(orden);
}

// PATCH /api/ordenes-trabajo/:id/asignar-mecanico
async function asignarMecanico(req, res) {
  const id = Number(req.params.id);
  const { mecanicoId } = req.body;

  const orden = await prisma.ordenTrabajo.update({
    where: { id },
    data: { mecanicoId: Number(mecanicoId) },
    include,
  });
  res.json(orden);
}

// PATCH /api/ordenes-trabajo/:id/estado
// Regla de negocio (RNF/Reglas de negocio):
//   - No se puede cerrar una OT sin factura pagada.
//   - No se puede entregar el vehiculo (CERRADA) con pagos pendientes.
async function cambiarEstado(req, res) {
  const id = Number(req.params.id);
  const { estado } = req.body;

  const orden = await prisma.ordenTrabajo.findUnique({ where: { id }, include: { facturas: true } });
  if (!orden) throw ApiError.notFound('Orden de trabajo no encontrada.');

  if (estado === 'CERRADA') {
    if (orden.facturas.length === 0) {
      throw ApiError.conflict('No se puede cerrar la OT: no tiene factura generada.');
    }
    const tienePendiente = orden.facturas.some((f) => f.estadoPago !== 'PAGADA');
    if (tienePendiente) {
      throw ApiError.conflict('No se puede cerrar/entregar el vehiculo: existen pagos pendientes en la factura.');
    }
  }

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id },
    data: {
      estado,
      fechaCierre: estado === 'CERRADA' ? new Date() : orden.fechaCierre,
    },
    include,
  });
  res.json(actualizada);
}

module.exports = { listar, obtener, crear, asignarMecanico, cambiarEstado };
