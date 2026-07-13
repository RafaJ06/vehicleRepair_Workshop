// ... importaciones ...
router.post(
  '/',
  authorize('mecanico', 'supervisor', 'administrador'),
  [
    body('id_vehiculo').isInt().withMessage('id_vehiculo es requerido y debe ser un número entero'), 
    body('fallaDetectada').notEmpty().withMessage('fallaDetectada es requerida')
  ],
  validate,
  asyncHandler(ctrl.crear)
);