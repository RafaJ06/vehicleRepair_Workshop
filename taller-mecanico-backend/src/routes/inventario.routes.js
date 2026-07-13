<<<<<<< HEAD
const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/inventario.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
=======
const { Router } = require("express");
const { body, param } = require("express-validator");

const ctrl = require("../controllers/inventario.controller");

const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middlewares/validate.middleware");

const {
    verifyToken,
    authorize,
} = require("../middlewares/auth.middleware");
>>>>>>> origin/development

const router = Router();

router.use(verifyToken);

<<<<<<< HEAD
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
=======
router.get("/", asyncHandler(ctrl.listar));

router.get(
    "/:id",
    param("id").isInt(),
    validate,
    asyncHandler(ctrl.obtener)
);

router.post(
    "/",
    authorize("administrador", "supervisor"),
    [
        body("nombre").notEmpty(),
        body("precio_unitario").isFloat({ min: 0 }),
        body("stock").optional().isInt({ min: 0 }),
        body("id_impuesto").optional().isInt(),
        body("estado").optional().isBoolean(),
    ],
    validate,
    asyncHandler(ctrl.crear)
);

router.put(
    "/:id",
    authorize("administrador", "supervisor"),
    [
        param("id").isInt(),
        body("nombre").notEmpty(),
        body("precio_unitario").isFloat({ min: 0 }),
        body("stock").optional().isInt({ min: 0 }),
        body("id_impuesto").optional().isInt(),
        body("estado").optional().isBoolean(),
    ],
    validate,
    asyncHandler(ctrl.actualizar)
);

router.patch(
    "/:id/ajustar-stock",
    authorize("administrador", "supervisor"),
    [
        param("id").isInt(),
        body("cantidad").isInt(),
    ],
    validate,
    asyncHandler(ctrl.ajustarStock)
);

module.exports = router;
>>>>>>> origin/development
