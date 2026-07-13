const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// Relaciones que siempre se incluyen en las respuestas
const include = {
  mecanico: { select: { id: true, nombre: true, email: true } },
  diagnosticos: {
    include: {
      vehiculos: { select: { id: true, marca: true, modelo: true, placa: true, chasis: true } },
    },
  },
  facturas: {
    select: {
      id: true,
      id_cliente: true,
      fecha: true,
      subtotal: true,
      total_impuestos: true,
      total: true,
      estatus: true,
    },
  },
};

// Valores válidos para el campo estatus
const ESTATUS_VALIDOS = [
  'En Proceso',
  'En Diagnóstico',
  'En Reparación',
  'Esperando Repuestos',
  'Finalizada',
  'Cerrada',
  'Cancelada',
];

// ─────────────────────────────────────────────
// GET /api/ordenes-trabajo
// Query params opcionales: estatus, mecanicoId, diagnosticoId, page, limit
// ─────────────────────────────────────────────
async function listar(req, res) {
  const { estatus, mecanicoId, diagnosticoId, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    estado: true, // solo registros activos (soft delete)
    ...(estatus && { estatus }),
    ...(mecanicoId && { mecanicoId: Number(mecanicoId) }),
    ...(diagnosticoId && { id_diagnostico: Number(diagnosticoId) }),
  };

  const [data, total] = await Promise.all([
    prisma.ordenTrabajo.findMany({
      where,
      include,
      orderBy: { fecha_creacion: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.ordenTrabajo.count({ where }),
  ]);

  res.json({ data, total, page: Number(page), limit: Number(limit) });
}

// ─────────────────────────────────────────────
// GET /api/ordenes-trabajo/:id
// ─────────────────────────────────────────────
async function obtener(req, res) {
  const id = Number(req.params.id);

  const orden = await prisma.ordenTrabajo.findFirst({
    where: { id, estado: true },
    include,
  });

  if (!orden) throw ApiError.notFound('Orden de trabajo no encontrada.');
  res.json(orden);
}

// ─────────────────────────────────────────────
// POST /api/ordenes-trabajo
// body: { id_diagnostico?, mecanicoId? }
// ─────────────────────────────────────────────
async function crear(req, res) {
  const { id_diagnostico, mecanicoId } = req.body;

  // Validar diagnóstico si se envía
  if (id_diagnostico) {
    const diagnostico = await prisma.diagnostico.findFirst({
      where: { id: Number(id_diagnostico), estado: true },
    });
    if (!diagnostico) throw ApiError.badRequest('El diagnóstico indicado no existe o está inactivo.');
  }

  // Validar mecánico si se envía
  if (mecanicoId) {
    const mecanico = await prisma.usuario.findFirst({
      where: { id: Number(mecanicoId), estado: true },
    });
    if (!mecanico) throw ApiError.badRequest('El mecánico indicado no existe o está inactivo.');
  }

  const orden = await prisma.ordenTrabajo.create({
    data: {
      id_diagnostico: id_diagnostico ? Number(id_diagnostico) : null,
      mecanicoId: mecanicoId ? Number(mecanicoId) : null,
      estatus: 'En Proceso',
    },
    include,
  });

  res.status(201).json(orden);
}

// ─────────────────────────────────────────────
// PUT /api/ordenes-trabajo/:id
// body: { id_diagnostico?, mecanicoId?, estatus? }
// ─────────────────────────────────────────────
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { id_diagnostico, mecanicoId, estatus } = req.body;

  // Verificar que existe
  const ordenExistente = await prisma.ordenTrabajo.findFirst({
    where: { id, estado: true },
  });
  if (!ordenExistente) throw ApiError.notFound('Orden de trabajo no encontrada.');

  // Validar estatus si se envía
  if (estatus && !ESTATUS_VALIDOS.includes(estatus)) {
    throw ApiError.badRequest(`Estatus inválido. Valores permitidos: ${ESTATUS_VALIDOS.join(', ')}`);
  }

  // Validar diagnóstico si se envía
  if (id_diagnostico) {
    const diagnostico = await prisma.diagnostico.findFirst({
      where: { id: Number(id_diagnostico), estado: true },
    });
    if (!diagnostico) throw ApiError.badRequest('El diagnóstico indicado no existe o está inactivo.');
  }

  // Validar mecánico si se envía
  if (mecanicoId) {
    const mecanico = await prisma.usuario.findFirst({
      where: { id: Number(mecanicoId), estado: true },
    });
    if (!mecanico) throw ApiError.badRequest('El mecánico indicado no existe o está inactivo.');
  }

  // Si se está cerrando, verificar que tenga factura pagada
  if (estatus === 'Cerrada') {
    const factura = await prisma.factura.findFirst({
      where: { otId: id, estado: true },
    });
    if (!factura) {
      throw ApiError.conflict('No se puede cerrar la OT: no tiene factura generada.');
    }
    if (factura.estatus !== 'Pagada') {
      throw ApiError.conflict('No se puede cerrar la OT: la factura aún no está pagada.');
    }
  }

  const dataActualizar = {
    ...(id_diagnostico !== undefined && { id_diagnostico: id_diagnostico ? Number(id_diagnostico) : null }),
    ...(mecanicoId !== undefined && { mecanicoId: mecanicoId ? Number(mecanicoId) : null }),
    ...(estatus && { estatus }),
    ...(estatus === 'Cerrada' && { fechaCierre: new Date() }),
  };

  const orden = await prisma.ordenTrabajo.update({
    where: { id },
    data: dataActualizar,
    include,
  });

  res.json(orden);
}

// ─────────────────────────────────────────────
// PATCH /api/ordenes-trabajo/:id/asignar-mecanico
// body: { mecanicoId }
// ─────────────────────────────────────────────
async function asignarMecanico(req, res) {
  const id = Number(req.params.id);
  const { mecanicoId } = req.body;

  const ordenExistente = await prisma.ordenTrabajo.findFirst({
    where: { id, estado: true },
  });
  if (!ordenExistente) throw ApiError.notFound('Orden de trabajo no encontrada.');

  const mecanico = await prisma.usuario.findFirst({
    where: { id: Number(mecanicoId), estado: true },
  });
  if (!mecanico) throw ApiError.badRequest('El mecánico indicado no existe o está inactivo.');

  const orden = await prisma.ordenTrabajo.update({
    where: { id },
    data: { mecanicoId: Number(mecanicoId) },
    include,
  });

  res.json(orden);
}

// ─────────────────────────────────────────────
// PATCH /api/ordenes-trabajo/:id/estatus
// body: { estatus }
// Reglas de negocio:
//   - Para cerrar la OT debe tener factura con estatus "Pagada"
// ─────────────────────────────────────────────
async function cambiarEstatus(req, res) {
  const id = Number(req.params.id);
  const { estatus } = req.body;

  if (!ESTATUS_VALIDOS.includes(estatus)) {
    throw ApiError.badRequest(`Estatus inválido. Valores permitidos: ${ESTATUS_VALIDOS.join(', ')}`);
  }

  const orden = await prisma.ordenTrabajo.findFirst({
    where: { id, estado: true },
    include: { facturas: true },
  });
  if (!orden) throw ApiError.notFound('Orden de trabajo no encontrada.');

  if (estatus === 'Cerrada') {
    if (!orden.facturas) {
      throw ApiError.conflict('No se puede cerrar la OT: no tiene factura generada.');
    }
    if (orden.facturas.estatus !== 'Pagada') {
      throw ApiError.conflict('No se puede cerrar la OT: la factura aún no está pagada.');
    }
  }

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id },
    data: {
      estatus,
      fechaCierre: estatus === 'Cerrada' ? new Date() : orden.fechaCierre,
    },
    include,
  });

  res.json(actualizada);
}

// ─────────────────────────────────────────────
// DELETE /api/ordenes-trabajo/:id  (soft delete)
// No se puede eliminar una OT que tenga factura activa
// ─────────────────────────────────────────────
async function eliminar(req, res) {
  const id = Number(req.params.id);

  const orden = await prisma.ordenTrabajo.findFirst({
    where: { id, estado: true },
    include: { facturas: true },
  });
  if (!orden) throw ApiError.notFound('Orden de trabajo no encontrada.');

  if (orden.facturas && orden.facturas.estado) {
    throw ApiError.conflict('No se puede eliminar una orden de trabajo que tiene una factura activa.');
  }

  await prisma.ordenTrabajo.update({
    where: { id },
    data: { estado: false },
  });

  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, asignarMecanico, cambiarEstatus, eliminar };