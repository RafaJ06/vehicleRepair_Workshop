const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  asyncHandler(ctrl.login)
);

// Solo un administrador ya autenticado puede crear nuevas cuentas
router.post(
  '/registro',
  verifyToken,
  authorize('administrador'),
  [
    body('nombre').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }).withMessage('password debe tener al menos 8 caracteres'),
    body('rolNombre').isIn(['recepcionista', 'mecanico', 'supervisor', 'administrador']),
  ],
  validate,
  asyncHandler(ctrl.registro)
);

router.get('/perfil', verifyToken, asyncHandler(ctrl.perfil));

module.exports = router;
