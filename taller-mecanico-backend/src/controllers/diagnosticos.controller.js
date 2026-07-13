const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/diagnosticos?otId=
async function listar(req, res) {
  const { otId } = req.query;
<<<<<<< HEAD
  const where = otId ? { otId: Number(otId) } : {};
  const diagnosticos = await prisma.diagnostico.findMany({ where, orderBy: { createdAt: 'desc' } });
=======
  
  // Buscar diagnósticos. Si envían otId, filtramos por la relación inversa hacia la OT.
  const where = {
    estado: true,
    ...(otId && {
      ordenes_trabajo: {
        some: { id: Number(otId) }
      }
    })
  };

  const diagnosticos = await prisma.diagnostico.findMany({ 
    where, 
    orderBy: { fecha: 'desc' } // En el schema se llama "fecha", no "createdAt"
  });
  
>>>>>>> origin/development
  res.json(diagnosticos);
}

// POST /api/diagnosticos  -> CU-02 Registrar Diagnostico
async function crear(req, res) {
<<<<<<< HEAD
  const { otId, presionBaja, presionAlta, temperatura, fallaDetectada } = req.body;

  const orden = await prisma.ordenTrabajo.findUnique({ where: { id: Number(otId) } });
  if (!orden) throw ApiError.badRequest('La orden de trabajo indicada no existe.');

  const diagnostico = await prisma.diagnostico.create({
    data: {
      otId: Number(otId),
=======
  const { otId, presionBaja, presionAlta, temperatura, fallaDetectada, id_vehiculo } = req.body;

  // 1. Validar que la Orden de Trabajo existe
  const orden = await prisma.ordenTrabajo.findUnique({ where: { id: Number(otId) } });
  if (!orden || !orden.estado) throw ApiError.badRequest('La orden de trabajo indicada no existe o fue eliminada.');

  // 2. Crear el registro en la tabla diagnosticos
  const diagnostico = await prisma.diagnostico.create({
    data: {
      id_vehiculo: id_vehiculo ? Number(id_vehiculo) : null, // Recomendado pasarlo desde el frontend para mantener el historial
>>>>>>> origin/development
      presionBaja: presionBaja ?? null,
      presionAlta: presionAlta ?? null,
      temperatura: temperatura ?? null,
      fallaDetectada,
    },
  });

<<<<<<< HEAD
  // Mover la OT a estado EN_DIAGNOSTICO si sigue ABIERTA
  if (orden.estado === 'ABIERTA') {
    await prisma.ordenTrabajo.update({ where: { id: orden.id }, data: { estado: 'EN_DIAGNOSTICO' } });
  }
=======
  // 3. Vincular el diagnóstico a la OT y actualizar su estatus lógico
  await prisma.ordenTrabajo.update({ 
    where: { id: orden.id }, 
    data: { 
      id_diagnostico: diagnostico.id,
      // Usamos "estatus" (texto) en lugar de "estado" (booleano)
      estatus: orden.estatus === 'En Proceso' ? 'Diagnosticado' : orden.estatus 
    } 
  });
>>>>>>> origin/development

  res.status(201).json(diagnostico);
}

<<<<<<< HEAD
module.exports = { listar, crear };
=======
module.exports = { listar, crear };
>>>>>>> origin/development
