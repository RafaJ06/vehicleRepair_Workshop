const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const select = {
  id: true,
  nombre: true,
  email: true,
<<<<<<< HEAD
  activo: true,
  rol: { select: { nombre: true } },
  sucursal: { select: { nombre: true } },
=======
  estado: true,
  rol: { select: { nombre: true } },
  // sucursal: { select: { nombre: true } },
>>>>>>> origin/development
};

// GET /api/usuarios
async function listar(req, res) {
<<<<<<< HEAD
  const usuarios = await prisma.usuario.findMany({ select, orderBy: { id: 'desc' } });
=======
  const usuarios = await prisma.usuario.findMany({ select, orderBy: { id: 'asc' } });
>>>>>>> origin/development
  res.json(usuarios);
}

// PATCH /api/usuarios/:id/estado  (activar / desactivar acceso)
async function cambiarEstado(req, res) {
  const id = Number(req.params.id);
<<<<<<< HEAD
  const { activo } = req.body;

  const usuario = await prisma.usuario.update({ where: { id }, data: { activo }, select });
=======
  const { estado} = req.body;

  const usuario = await prisma.usuario.update({ where: { id }, data: { estado }, select });
>>>>>>> origin/development
  res.json(usuario);
}

// PATCH /api/usuarios/:id/rol  (cambiar permisos)
async function cambiarRol(req, res) {
  const id = Number(req.params.id);
  const { rolNombre } = req.body;

<<<<<<< HEAD
  const rol = await prisma.rol.findUnique({ where: { nombre: rolNombre } });
=======
  const rol = await prisma.rol.findFirst({ where: { nombre: rolNombre } });
>>>>>>> origin/development
  if (!rol) throw ApiError.badRequest('El rol indicado no existe.');

  const usuario = await prisma.usuario.update({ where: { id }, data: { rolId: rol.id }, select });
  res.json(usuario);
}

module.exports = { listar, cambiarEstado, cambiarRol };
