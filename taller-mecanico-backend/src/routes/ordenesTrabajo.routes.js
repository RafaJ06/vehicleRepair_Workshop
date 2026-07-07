const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/ordenesTrabajo.controller');
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
  [
    body('clienteId').isInt(),
    body('vehiculoId').isInt(),
    body('problemaReportado').notEmpty().withMessage('problemaReportado es requerido'),
  ],
  validate,
  asyncHandler(ctrl.crear)
);

router.patch(
  '/:id/asignar-mecanico',
  authorize('supervisor', 'administrador'),
  [param('id').isInt(), body('mecanicoId').isInt()],
  validate,
  asyncHandler(ctrl.asignarMecanico)
);

router.patch(
  '/:id/estado',
  authorize('mecanico', 'supervisor', 'recepcionista', 'administrador'),
  [
    param('id').isInt(),
    body('estado').isIn([
      'ABIERTA',
      'EN_DIAGNOSTICO',
      'EN_REPARACION',
      'ESPERANDO_REPUESTOS',
      'FINALIZADA',
      'CERRADA',
      'CANCELADA',
    ]),
  ],
  validate,
  asyncHandler(ctrl.cambiarEstado)
);

module.exports = router;
