const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/vehiculos.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

<<<<<<< HEAD
=======
// Ajuste: anio y placa son opcionales según la BD, usamos .optional()
>>>>>>> origin/development
const reglasVehiculo = [
  body('clienteId').isInt().withMessage('clienteId es requerido'),
  body('chasis').notEmpty().withMessage('chasis es requerido'),
  body('marca').notEmpty().withMessage('marca es requerida'),
  body('modelo').notEmpty().withMessage('modelo es requerido'),
<<<<<<< HEAD
  body('anio').isInt({ min: 1950, max: 2100 }).withMessage('anio invalido'),
  body('placa').notEmpty().withMessage('placa es requerida'),
=======
  body('anio').optional().isInt({ min: 1950, max: 2100 }).withMessage('anio invalido'),
  body('placa').optional().notEmpty().withMessage('placa no puede estar vacía si se envía'),
>>>>>>> origin/development
];

router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));
router.post('/', authorize('recepcionista', 'administrador'), reglasVehiculo, validate, asyncHandler(ctrl.crear));
router.put('/:id', authorize('recepcionista', 'administrador'), param('id').isInt(), validate, asyncHandler(ctrl.actualizar));
router.delete('/:id', authorize('administrador'), param('id').isInt(), validate, asyncHandler(ctrl.eliminar));

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> origin/development
