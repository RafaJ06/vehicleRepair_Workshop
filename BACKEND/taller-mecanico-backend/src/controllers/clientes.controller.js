const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/clientes?search=&page=&limit=
async function listar(req, res) {
  const { search = '', page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = search
    ? {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { identificacion: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.cliente.findMany({ where, skip, take: Number(limit), orderBy: { id: 'desc' } }),
    prisma.cliente.count({ where }),
  ]);

  res.json({ data, total, page: Number(page), limit: Number(limit) });
}

// GET /api/clientes/:id
async function obtener(req, res) {
  const id = Number(req.params.id);
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { vehiculos: true },
  });
  if (!cliente) throw ApiError.notFound('Cliente no encontrado.');
  res.json(cliente);
}

// POST /api/clientes
async function crear(req, res) {
  const { tipoCliente, tipoIdentificacion, identificacion, nombre, telefono, direccion, email } = req.body;

  const cliente = await prisma.cliente.create({
    data: { tipoCliente, tipoIdentificacion, identificacion, nombre, telefono, direccion, email },
  });
  res.status(201).json(cliente);
}

// PUT /api/clientes/:id
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { tipoCliente, tipoIdentificacion, identificacion, nombre, telefono, direccion, email } = req.body;

  const cliente = await prisma.cliente.update({
    where: { id },
    data: { tipoCliente, tipoIdentificacion, identificacion, nombre, telefono, direccion, email },
  });
  res.json(cliente);
}

// DELETE /api/clientes/:id
async function eliminar(req, res) {
  const id = Number(req.params.id);
  await prisma.cliente.delete({ where: { id } });
  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
