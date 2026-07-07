const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { rol: true },
  });
  if (!usuario || !usuario.activo) throw ApiError.unauthorized('Credenciales invalidas.');

  const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValido) throw ApiError.unauthorized('Credenciales invalidas.');

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol.nombre, sucursalId: usuario.sucursalId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol.nombre },
  });
}

// POST /api/auth/registro  (normalmente solo el administrador crea usuarios -> ver rutas)
async function registro(req, res) {
  const { nombre, email, password, rolNombre, sucursalId } = req.body;

  const rol = await prisma.rol.findUnique({ where: { nombre: rolNombre } });
  if (!rol) throw ApiError.badRequest('El rol indicado no existe.');

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      rolId: rol.id,
      sucursalId: sucursalId ? Number(sucursalId) : null,
    },
    include: { rol: true },
  });

  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol.nombre });
}

// GET /api/auth/perfil
async function perfil(req, res) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    include: { rol: true, sucursal: true },
  });
  if (!usuario) throw ApiError.notFound('Usuario no encontrado.');
  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol.nombre,
    sucursal: usuario.sucursal?.nombre ?? null,
  });
}

module.exports = { login, registro, perfil };
