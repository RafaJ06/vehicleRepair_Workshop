const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/citas.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));

router.post(
  '/',
  authorize('recepcionista', 'administrador'),
  [body('clienteId').isInt(), body('fechaHora').isISO8601().withMessage('fechaHora debe ser una fecha ISO valida')],
  validate,
  asyncHandler(ctrl.crear)
);

router.put('/:id', authorize('recepcionista', 'administrador'), param('id').isInt(), validate, asyncHandler(ctrl.actualizar));

router.patch(
  '/:id/cancelar',
  authorize('recepcionista', 'administrador'),
  param('id').isInt(),
  validate,
  asyncHandler(ctrl.cancelar)
);

module.exports = router;
