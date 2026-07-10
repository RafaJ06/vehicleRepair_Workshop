const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/diagnosticos?otId=
async function listar(req, res) {
  const { otId } = req.query;
  const where = otId ? { otId: Number(otId) } : {};
  const diagnosticos = await prisma.diagnostico.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(diagnosticos);
}

// POST /api/diagnosticos  -> CU-02 Registrar Diagnostico
async function crear(req, res) {
  const { otId, presionBaja, presionAlta, temperatura, fallaDetectada } = req.body;

  const orden = await prisma.ordenTrabajo.findUnique({ where: { id: Number(otId) } });
  if (!orden) throw ApiError.badRequest('La orden de trabajo indicada no existe.');

  const diagnostico = await prisma.diagnostico.create({
    data: {
      otId: Number(otId),
      presionBaja: presionBaja ?? null,
      presionAlta: presionAlta ?? null,
      temperatura: temperatura ?? null,
      fallaDetectada,
    },
  });

  // Mover la OT a estado EN_DIAGNOSTICO si sigue ABIERTA
  if (orden.estado === 'ABIERTA') {
    await prisma.ordenTrabajo.update({ where: { id: orden.id }, data: { estado: 'EN_DIAGNOSTICO' } });
  }

  res.status(201).json(diagnostico);
}

module.exports = { listar, crear };
