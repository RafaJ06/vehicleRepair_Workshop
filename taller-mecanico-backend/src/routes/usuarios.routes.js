const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/usuarios.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken, authorize('administrador'));

router.get('/', asyncHandler(ctrl.listar));

router.patch(
  '/:id/estado',
<<<<<<< HEAD
  [param('id').isInt(), body('activo').isBoolean()],
=======
  [param('id').isInt(), body('estado').isBoolean()],
>>>>>>> origin/development
  validate,
  asyncHandler(ctrl.cambiarEstado)
);

router.patch(
  '/:id/rol',
  [param('id').isInt(), body('rolNombre').isIn(['recepcionista', 'mecanico', 'supervisor', 'administrador'])],
  validate,
  asyncHandler(ctrl.cambiarRol)
);

module.exports = router;
