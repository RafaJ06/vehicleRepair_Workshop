const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/clientes.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

const reglasCliente = [
  // 1. Validamos la clave foránea (debe ser un número entero)
  body('id_tipo_identificacion')
    .notEmpty().withMessage('El id_tipo_identificacion es requerido')
    .isInt().withMessage('El id_tipo_identificacion debe ser un número entero'),

  // 2. Validamos el número de documento: exactamente 11 digitos numericos (cedula RD)
  body('identificacion')
  .notEmpty().withMessage('La identificacion es requerida')
  .bail()
  .customSanitizer((valor) => valor.replace(/[-\s]/g, '')) // quita guiones y espacios
  .matches(/^\d{11}$/).withMessage('La identificacion debe tener exactamente 11 digitos numericos'),

  // 3. Validamos el nombre
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido'),

  // 4. Validamos el email (es opcional, pero si se envía, debe tener formato de correo)
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('El email tiene un formato inválido')
];

router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));
router.post('/', authorize('recepcionista', 'administrador'), reglasCliente, validate, asyncHandler(ctrl.crear));
router.put('/:id', authorize('recepcionista', 'administrador'), param('id').isInt(), reglasCliente, validate, asyncHandler(ctrl.actualizar));
router.delete('/:id', authorize('administrador'), param('id').isInt(), validate, asyncHandler(ctrl.eliminar));

module.exports = router;