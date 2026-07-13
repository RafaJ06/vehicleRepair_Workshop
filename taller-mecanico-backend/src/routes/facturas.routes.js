const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/facturas.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));

router.post(
  '/',
  authorize('recepcionista', 'administrador'),
  [body('otId').isInt(), body('formaPago').notEmpty(), body('items').isArray({ min: 1 })],
  validate,
  asyncHandler(ctrl.crear)
);

router.patch(
  '/:id/pago',
  authorize('recepcionista', 'administrador'),
  [param('id').isInt(), body('estadoPago').isIn(['PENDIENTE', 'PARCIAL', 'PAGADA'])],
  validate,
  asyncHandler(ctrl.registrarPago)
);

module.exports = router;
