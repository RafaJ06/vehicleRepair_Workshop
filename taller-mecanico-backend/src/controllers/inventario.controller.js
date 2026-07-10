const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/inventario?bajoStock=true
async function listar(req, res) {
  const { bajoStock } = req.query;
  const materiales = await prisma.material.findMany({ orderBy: { nombre: 'asc' } });

  const data = bajoStock === 'true' ? materiales.filter((m) => m.stock <= m.stockMinimo) : materiales;
  res.json(data);
}

// GET /api/inventario/:id
async function obtener(req, res) {
  const id = Number(req.params.id);
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) throw ApiError.notFound('Material no encontrado.');
  res.json(material);
}

// POST /api/inventario
async function crear(req, res) {
  const { nombre, descripcion, precioUnitario, stock, stockMinimo } = req.body;
  const material = await prisma.material.create({
    data: {
      nombre,
      descripcion,
      precioUnitario,
      stock: stock ?? 0,
      stockMinimo: stockMinimo ?? 0,
    },
  });
  res.status(201).json(material);
}

// PUT /api/inventario/:id
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { nombre, descripcion, precioUnitario, stockMinimo } = req.body;
  const material = await prisma.material.update({
    where: { id },
    data: { nombre, descripcion, precioUnitario, stockMinimo },
  });
  res.json(material);
}

// PATCH /api/inventario/:id/ajustar-stock  (entradas de mercancia, ajustes manuales)
async function ajustarStock(req, res) {
  const id = Number(req.params.id);
  const { cantidad } = req.body; // puede ser negativo o positivo

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) throw ApiError.notFound('Material no encontrado.');

  const nuevoStock = material.stock + Number(cantidad);
  if (nuevoStock < 0) throw ApiError.badRequest('El ajuste dejaria el stock en negativo.');

  const actualizado = await prisma.material.update({ where: { id }, data: { stock: nuevoStock } });
  res.json(actualizado);
}

module.exports = { listar, obtener, crear, actualizar, ajustarStock };
