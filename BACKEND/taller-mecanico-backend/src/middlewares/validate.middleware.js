const { validationResult } = require('express-validator');

// Se coloca despues de un arreglo de validaciones de express-validator en la ruta
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos invalidos.', details: errors.array() });
  }
  return next();
}

module.exports = validate;
