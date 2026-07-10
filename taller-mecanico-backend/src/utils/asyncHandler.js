// Envuelve funciones async de Express para pasar los errores a next()
// automaticamente, en vez de repetir try/catch en cada controlador.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
