const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/inventario.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));

router.post(
  '/',
  authorize('administrador', 'supervisor'),
  [body('nombre').notEmpty(), body('precioUnitario').isFloat({ min: 0 })],
  validate,
  asyncHandler(ctrl.crear)
);

router.put('/:id', authorize('administrador', 'supervisor'), param('id').isInt(), validate, asyncHandler(ctrl.actualizar));

router.patch(
  '/:id/ajustar-stock',
  authorize('administrador', 'supervisor'),
  [param('id').isInt(), body('cantidad').isInt()],
  validate,
  asyncHandler(ctrl.ajustarStock)
);

module.exports = router;
