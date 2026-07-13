const { Router } = require('express');
<<<<<<< HEAD
const { body, param, query } = require('express-validator');
=======
<<<<<<< HEAD
const { body, param } = require('express-validator');
=======
const { body, param, query } = require('express-validator');
>>>>>>> feature/ordenes-trabajo
>>>>>>> b45b674414d60c146ad3dda0e6fade74198f150f
const ctrl = require('../controllers/ordenesTrabajo.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

<<<<<<< HEAD
// Todas las rutas requieren autenticación
=======
<<<<<<< HEAD
>>>>>>> b45b674414d60c146ad3dda0e6fade74198f150f
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Órdenes de Trabajo
 *   description: Gestión de órdenes de trabajo del taller
 */

/**
 * @swagger
 * /ordenes-trabajo:
 *   get:
 *     summary: Listar órdenes de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estatus
 *         schema:
 *           type: string
 *           enum: [En Proceso, En Diagnóstico, En Reparación, Esperando Repuestos, Finalizada, Cerrada, Cancelada]
 *         description: Filtrar por estatus
 *       - in: query
 *         name: mecanicoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del mecánico asignado
 *       - in: query
 *         name: diagnosticoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del diagnóstico
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista paginada de órdenes de trabajo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrdenTrabajo'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get(
  '/',
  [
    query('mecanicoId').optional().isInt().withMessage('mecanicoId debe ser un número entero'),
    query('diagnosticoId').optional().isInt().withMessage('diagnosticoId debe ser un número entero'),
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor a 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
  ],
  validate,
  asyncHandler(ctrl.listar)
);

/**
 * @swagger
 * /ordenes-trabajo/{id}:
 *   get:
 *     summary: Obtener una orden de trabajo por ID
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la orden de trabajo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajo'
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));

/**
 * @swagger
 * /ordenes-trabajo:
 *   post:
 *     summary: Crear una nueva orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_diagnostico:
 *                 type: integer
 *                 description: ID del diagnóstico asociado (opcional)
 *               mecanicoId:
 *                 type: integer
 *                 description: ID del mecánico asignado (opcional)
 *             example:
 *               id_diagnostico: 1
 *               mecanicoId: 3
 *     responses:
 *       201:
 *         description: Orden de trabajo creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajo'
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  authorize('recepcionista', 'administrador', 'supervisor'),
  [
<<<<<<< HEAD
    body('id_diagnostico').optional().isInt().withMessage('id_diagnostico debe ser un entero'),
    body('mecanicoId').optional().isInt().withMessage('mecanicoId debe ser un entero'),
=======
    body('clienteId').isInt(),
    body('vehiculoId').isInt(),
    body('problemaReportado').notEmpty().withMessage('problemaReportado es requerido'),
=======
// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Órdenes de Trabajo
 *   description: Gestión de órdenes de trabajo del taller
 */

/**
 * @swagger
 * /ordenes-trabajo:
 *   get:
 *     summary: Listar órdenes de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estatus
 *         schema:
 *           type: string
 *           enum: [En Proceso, En Diagnóstico, En Reparación, Esperando Repuestos, Finalizada, Cerrada, Cancelada]
 *         description: Filtrar por estatus
 *       - in: query
 *         name: mecanicoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del mecánico asignado
 *       - in: query
 *         name: diagnosticoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del diagnóstico
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista paginada de órdenes de trabajo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrdenTrabajo'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get(
  '/',
  [
    query('mecanicoId').optional().isInt().withMessage('mecanicoId debe ser un número entero'),
    query('diagnosticoId').optional().isInt().withMessage('diagnosticoId debe ser un número entero'),
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor a 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
  ],
  validate,
  asyncHandler(ctrl.listar)
);

/**
 * @swagger
 * /ordenes-trabajo/{id}:
 *   get:
 *     summary: Obtener una orden de trabajo por ID
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la orden de trabajo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajo'
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));

/**
 * @swagger
 * /ordenes-trabajo:
 *   post:
 *     summary: Crear una nueva orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_diagnostico:
 *                 type: integer
 *                 description: ID del diagnóstico asociado (opcional)
 *               mecanicoId:
 *                 type: integer
 *                 description: ID del mecánico asignado (opcional)
 *             example:
 *               id_diagnostico: 1
 *               mecanicoId: 3
 *     responses:
 *       201:
 *         description: Orden de trabajo creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajo'
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  authorize('recepcionista', 'administrador', 'supervisor'),
  [
    body('id_diagnostico').optional().isInt().withMessage('id_diagnostico debe ser un entero'),
    body('mecanicoId').optional().isInt().withMessage('mecanicoId debe ser un entero'),
>>>>>>> feature/ordenes-trabajo
>>>>>>> b45b674414d60c146ad3dda0e6fade74198f150f
  ],
  validate,
  asyncHandler(ctrl.crear)
);

<<<<<<< HEAD
/**
 * @swagger
 * /ordenes-trabajo/{id}:
 *   put:
 *     summary: Actualizar una orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_diagnostico:
 *                 type: integer
 *               mecanicoId:
 *                 type: integer
 *               estatus:
 *                 type: string
 *                 enum: [En Proceso, En Diagnóstico, En Reparación, Esperando Repuestos, Finalizada, Cerrada, Cancelada]
 *     responses:
 *       200:
 *         description: Orden actualizada
 *       404:
 *         description: Orden no encontrada
 */
router.put(
  '/:id',
  authorize('recepcionista', 'supervisor', 'administrador'),
  [
    param('id').isInt(),
    body('id_diagnostico').optional().isInt(),
    body('mecanicoId').optional().isInt(),
    body('estatus')
      .optional()
      .isIn(['En Proceso', 'En Diagnóstico', 'En Reparación', 'Esperando Repuestos', 'Finalizada', 'Cerrada', 'Cancelada'])
      .withMessage('Estatus inválido'),
  ],
  validate,
  asyncHandler(ctrl.actualizar)
);

/**
 * @swagger
 * /ordenes-trabajo/{id}/asignar-mecanico:
 *   patch:
 *     summary: Asignar un mecánico a la orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mecanicoId
 *             properties:
 *               mecanicoId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Mecánico asignado correctamente
 *       404:
 *         description: Orden no encontrada
 */
router.patch(
  '/:id/asignar-mecanico',
  authorize('supervisor', 'administrador'),
  [param('id').isInt(), body('mecanicoId').isInt().withMessage('mecanicoId es requerido y debe ser un entero')],
=======
<<<<<<< HEAD
router.patch(
  '/:id/asignar-mecanico',
  authorize('supervisor', 'administrador'),
  [param('id').isInt(), body('mecanicoId').isInt()],
=======
/**
 * @swagger
 * /ordenes-trabajo/{id}:
 *   put:
 *     summary: Actualizar una orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_diagnostico:
 *                 type: integer
 *               mecanicoId:
 *                 type: integer
 *               estatus:
 *                 type: string
 *                 enum: [En Proceso, En Diagnóstico, En Reparación, Esperando Repuestos, Finalizada, Cerrada, Cancelada]
 *     responses:
 *       200:
 *         description: Orden actualizada
 *       404:
 *         description: Orden no encontrada
 */
router.put(
  '/:id',
  authorize('recepcionista', 'supervisor', 'administrador'),
  [
    param('id').isInt(),
    body('id_diagnostico').optional().isInt(),
    body('mecanicoId').optional().isInt(),
    body('estatus')
      .optional()
      .isIn(['En Proceso', 'En Diagnóstico', 'En Reparación', 'Esperando Repuestos', 'Finalizada', 'Cerrada', 'Cancelada'])
      .withMessage('Estatus inválido'),
  ],
  validate,
  asyncHandler(ctrl.actualizar)
);

/**
 * @swagger
 * /ordenes-trabajo/{id}/asignar-mecanico:
 *   patch:
 *     summary: Asignar un mecánico a la orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mecanicoId
 *             properties:
 *               mecanicoId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Mecánico asignado correctamente
 *       404:
 *         description: Orden no encontrada
 */
router.patch(
  '/:id/asignar-mecanico',
  authorize('supervisor', 'administrador'),
  [param('id').isInt(), body('mecanicoId').isInt().withMessage('mecanicoId es requerido y debe ser un entero')],
>>>>>>> feature/ordenes-trabajo
>>>>>>> b45b674414d60c146ad3dda0e6fade74198f150f
  validate,
  asyncHandler(ctrl.asignarMecanico)
);

<<<<<<< HEAD
/**
 * @swagger
 * /ordenes-trabajo/{id}/estatus:
 *   patch:
 *     summary: Cambiar el estatus de una orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estatus
 *             properties:
 *               estatus:
 *                 type: string
 *                 enum: [En Proceso, En Diagnóstico, En Reparación, Esperando Repuestos, Finalizada, Cerrada, Cancelada]
 *     responses:
 *       200:
 *         description: Estatus actualizado
 *       409:
 *         description: Conflicto de regla de negocio (e.g. factura no pagada al cerrar)
 */
=======
<<<<<<< HEAD
>>>>>>> b45b674414d60c146ad3dda0e6fade74198f150f
router.patch(
  '/:id/estatus',
  authorize('mecanico', 'supervisor', 'recepcionista', 'administrador'),
  [
    param('id').isInt(),
    body('estatus')
      .isIn(['En Proceso', 'En Diagnóstico', 'En Reparación', 'Esperando Repuestos', 'Finalizada', 'Cerrada', 'Cancelada'])
      .withMessage('Estatus inválido'),
  ],
  validate,
  asyncHandler(ctrl.cambiarEstatus)
);

<<<<<<< HEAD
=======
=======
/**
 * @swagger
 * /ordenes-trabajo/{id}/estatus:
 *   patch:
 *     summary: Cambiar el estatus de una orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estatus
 *             properties:
 *               estatus:
 *                 type: string
 *                 enum: [En Proceso, En Diagnóstico, En Reparación, Esperando Repuestos, Finalizada, Cerrada, Cancelada]
 *     responses:
 *       200:
 *         description: Estatus actualizado
 *       409:
 *         description: Conflicto de regla de negocio (e.g. factura no pagada al cerrar)
 */
router.patch(
  '/:id/estatus',
  authorize('mecanico', 'supervisor', 'recepcionista', 'administrador'),
  [
    param('id').isInt(),
    body('estatus')
      .isIn(['En Proceso', 'En Diagnóstico', 'En Reparación', 'Esperando Repuestos', 'Finalizada', 'Cerrada', 'Cancelada'])
      .withMessage('Estatus inválido'),
  ],
  validate,
  asyncHandler(ctrl.cambiarEstatus)
);

>>>>>>> b45b674414d60c146ad3dda0e6fade74198f150f
/**
 * @swagger
 * /ordenes-trabajo/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) una orden de trabajo
 *     description: Realiza un soft delete. No se puede eliminar si tiene una factura activa.
 *     tags: [Órdenes de Trabajo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminada exitosamente
 *       404:
 *         description: Orden no encontrada
 *       409:
 *         description: No se puede eliminar por tener factura activa
 */
router.delete(
  '/:id',
  authorize('administrador'),
  param('id').isInt(),
  validate,
  asyncHandler(ctrl.eliminar)
);

/**
 * @swagger
 * components:
 *   schemas:
 *     OrdenTrabajo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_diagnostico:
 *           type: integer
 *           nullable: true
 *         mecanicoId:
 *           type: integer
 *           nullable: true
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fechaCierre:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         estatus:
 *           type: string
 *           enum: [En Proceso, En Diagnóstico, En Reparación, Esperando Repuestos, Finalizada, Cerrada, Cancelada]
 *         estado:
 *           type: boolean
 *         mecanico:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             email:
 *               type: string
 *         diagnosticos:
 *           type: object
 *           nullable: true
 *         facturas:
 *           type: object
 *           nullable: true
 */

<<<<<<< HEAD
module.exports = router;
=======
>>>>>>> feature/ordenes-trabajo
module.exports = router;
>>>>>>> b45b674414d60c146ad3dda0e6fade74198f150f
