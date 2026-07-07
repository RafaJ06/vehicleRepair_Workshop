const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/clientes.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

const reglasCliente = [
  body('tipoCliente').isIn(['natural', 'juridico']).withMessage('tipoCliente debe ser natural o juridico'),
  body('tipoIdentificacion').notEmpty().withMessage('tipoIdentificacion es requerida'),
  body('identificacion').notEmpty().withMessage('identificacion es requerida'),
  body('nombre').notEmpty().withMessage('nombre es requerido'),
  body('email').optional({ nullable: true }).isEmail().withMessage('email invalido'),
];

router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));
router.post('/', authorize('recepcionista', 'administrador'), reglasCliente, validate, asyncHandler(ctrl.crear));
router.put('/:id', authorize('recepcionista', 'administrador'), param('id').isInt(), reglasCliente, validate, asyncHandler(ctrl.actualizar));
router.delete('/:id', authorize('administrador'), param('id').isInt(), validate, asyncHandler(ctrl.eliminar));

module.exports = router;
