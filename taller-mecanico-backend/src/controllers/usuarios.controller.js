const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const select = {
  id: true,
  nombre: true,
  email: true,
  estado: true,
  rol: { select: { nombre: true } },
  // sucursal: { select: { nombre: true } },
};

// GET /api/usuarios
async function listar(req, res) {
  const usuarios = await prisma.usuario.findMany({ select, orderBy: { id: 'asc' } });
  res.json(usuarios);
}

// PATCH /api/usuarios/:id/estado  (activar / desactivar acceso)
async function cambiarEstado(req, res) {
  const id = Number(req.params.id);
  const { estado} = req.body;

  const usuario = await prisma.usuario.update({ where: { id }, data: { estado }, select });
  res.json(usuario);
}

// PATCH /api/usuarios/:id/rol  (cambiar permisos)
async function cambiarRol(req, res) {
  const id = Number(req.params.id);
  const { rolNombre } = req.body;

  const rol = await prisma.rol.findFirst({ where: { nombre: rolNombre } });
  if (!rol) throw ApiError.badRequest('El rol indicado no existe.');

  const usuario = await prisma.usuario.update({ where: { id }, data: { rolId: rol.id }, select });
  res.json(usuario);
}

module.exports = { listar, cambiarEstado, cambiarRol };
