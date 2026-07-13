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
  console.log(usuario)
  if (!usuario || !usuario.estado) throw ApiError.unauthorized('Credenciales invalidas. NO USER');

  const passwordValido = await bcrypt.compare(password, usuario.contrasena_hash);
  if (!passwordValido) throw ApiError.unauthorized('Credenciales invalidas.');

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol.nombre/*, sucursalId: usuario.sucursalId */},
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
  const { nombre, email, password, rolID } = req.body;

  const rol = await prisma.rol.findUnique({ where: { id: rolID } });
  if (!rol) throw ApiError.badRequest('El rol indicado no existe.');

  const contrasena_hash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      contrasena_hash,
      rolId: rol.id,
     // sucursalId: sucursalId ? Number(sucursalId) : null,
    },
    include: { rol: true },
  });

  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol.nombre });
}

// GET /api/auth/perfil
async function perfil(req, res) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    include: { rol: true },
  });
  console.log(req.user.id)
  if (!usuario) throw ApiError.notFound('Usuario no encontrado.');
  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol.nombre,
  });
}

module.exports = { login, registro, perfil };
