const { Router } = require('express');
const ctrl = require('../controllers/reportes.controller');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken, authorize('supervisor', 'administrador'));

router.get('/ordenes-por-estado', asyncHandler(ctrl.ordenesPorEstado));
router.get('/facturacion', asyncHandler(ctrl.facturacionPorPeriodo));
router.get('/inventario-bajo-stock', asyncHandler(ctrl.inventarioBajoStock));
router.get('/clientes-frecuentes', asyncHandler(ctrl.clientesFrecuentes));

module.exports = router;
