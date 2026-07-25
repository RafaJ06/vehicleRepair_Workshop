const ApiError = require('../utils/ApiError');

// Debe registrarse DESPUES de todas las rutas en app.js
function errorHandler(err, req, res, next) {
  // Errores conocidos de Prisma (registro no encontrado, unique constraint, etc.)
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflicto de datos: el valor ya existe (violacion de restriccion unica).',
      fields: err.meta?.target,
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro no encontrado.' });
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ error: 'Violacion de llave foranea: el registro relacionado no existe.' });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  console.error('[ERROR NO CONTROLADO]', err);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = errorHandler;
