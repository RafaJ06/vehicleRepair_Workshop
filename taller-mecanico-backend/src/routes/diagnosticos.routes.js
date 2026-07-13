const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/diagnosticos.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));
router.post(
  '/',
  authorize('mecanico', 'supervisor', 'administrador'),
<<<<<<< HEAD
  [body('otId').isInt(), body('fallaDetectada').notEmpty().withMessage('fallaDetectada es requerida')],
=======
  [
    body('otId').isInt().withMessage('otId es requerido y debe ser un número entero'), 
    body('fallaDetectada').notEmpty().withMessage('fallaDetectada es requerida')
  ],
>>>>>>> origin/development
  validate,
  asyncHandler(ctrl.crear)
);

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> origin/development
