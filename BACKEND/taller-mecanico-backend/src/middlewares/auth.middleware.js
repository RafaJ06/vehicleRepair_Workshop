const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// RF-08: Gestion de Usuarios - verifica el token JWT enviado en el header
// Authorization: Bearer <token>
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Token no proporcionado.'));
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, rol, sucursalId }
    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Token invalido o expirado.'));
  }
}

// Restringe el acceso a ciertos roles, ej: authorize('administrador', 'supervisor')
function authorize(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(ApiError.forbidden('No tienes permisos para esta accion.'));
    }
    return next();
  };
}

module.exports = { verifyToken, authorize };
