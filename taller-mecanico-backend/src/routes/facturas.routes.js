const { Router } = require('express');
<<<<<<< HEAD
const { body, param } = require('express-validator');
=======
const { body, param, query } = require('express-validator');
>>>>>>> feature/ordenes-trabajo
const ctrl = require('../controllers/facturas.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = Router();

<<<<<<< HEAD
router.use(verifyToken);

router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));

router.post(
  '/',
  authorize('recepcionista', 'administrador'),
  [body('otId').isInt(), body('formaPago').notEmpty(), body('items').isArray({ min: 1 })],
=======
// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Gestión de facturas del taller mecánico
 */

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Listar facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: otId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de orden de trabajo
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: estatus
 *         schema:
 *           type: string
 *           enum: [Pendiente, Pagada, Anulada]
 *         description: Filtrar por estatus de la factura
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
 *         description: Lista paginada de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Factura'
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
    query('otId').optional().isInt().withMessage('otId debe ser un entero'),
    query('clienteId').optional().isInt().withMessage('clienteId debe ser un entero'),
    query('estatus').optional().isIn(['Pendiente', 'Pagada', 'Anulada']).withMessage('Estatus inválido'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  asyncHandler(ctrl.listar)
);

/**
 * @swagger
 * /facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
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
 *         description: Datos de la factura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id', param('id').isInt(), validate, asyncHandler(ctrl.obtener));

/**
 * @swagger
 * /facturas:
 *   post:
 *     summary: Crear una nueva factura
 *     description: |
 *       Crea una factura asociada a una orden de trabajo.
 *       - Si un detalle tiene `id_material`, se descuenta del inventario automáticamente.
 *       - Si el estatus es "Pendiente", se crea automáticamente una cuenta por cobrar.
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otId
 *               - detalles
 *             properties:
 *               otId:
 *                 type: integer
 *                 description: ID de la orden de trabajo
 *               id_cliente:
 *                 type: integer
 *                 description: ID del cliente (opcional)
 *               estatus:
 *                 type: string
 *                 enum: [Pendiente, Pagada]
 *                 default: Pendiente
 *               detalles:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - cantidad
 *                     - precio_unitario
 *                     - valor_impuesto
 *                   properties:
 *                     id_material:
 *                       type: integer
 *                       description: ID del material/repuesto (opcional, si es un servicio puro se omite)
 *                     cantidad:
 *                       type: integer
 *                     precio_unitario:
 *                       type: number
 *                       format: decimal
 *                     valor_impuesto:
 *                       type: number
 *                       format: decimal
 *                       description: Valor de impuesto por unidad
 *               diagnosticos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de diagnósticos a vincular con la factura
 *           example:
 *             otId: 5
 *             id_cliente: 2
 *             estatus: Pendiente
 *             detalles:
 *               - id_material: 10
 *                 cantidad: 2
 *                 precio_unitario: 150.00
 *                 valor_impuesto: 27.00
 *               - cantidad: 1
 *                 precio_unitario: 200.00
 *                 valor_impuesto: 36.00
 *             diagnosticos: [3]
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: La OT ya tiene una factura activa, o stock insuficiente
 */
router.post(
  '/',
  authorize('recepcionista', 'administrador'),
  [
    body('otId').isInt().withMessage('otId es requerido y debe ser un entero'),
    body('id_cliente').optional().isInt().withMessage('id_cliente debe ser un entero'),
    body('estatus').optional().isIn(['Pendiente', 'Pagada']).withMessage('Estatus inválido (Pendiente | Pagada)'),
    body('detalles').isArray({ min: 1 }).withMessage('detalles debe ser un arreglo con al menos un elemento'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('Cada detalle debe tener una cantidad mayor a 0'),
    body('detalles.*.precio_unitario').isFloat({ min: 0 }).withMessage('precio_unitario debe ser un número positivo'),
    body('detalles.*.valor_impuesto').isFloat({ min: 0 }).withMessage('valor_impuesto debe ser un número positivo'),
    body('diagnosticos').optional().isArray().withMessage('diagnosticos debe ser un arreglo de IDs'),
  ],
>>>>>>> feature/ordenes-trabajo
  validate,
  asyncHandler(ctrl.crear)
);

<<<<<<< HEAD
router.patch(
  '/:id/pago',
  authorize('recepcionista', 'administrador'),
  [param('id').isInt(), body('estadoPago').isIn(['PENDIENTE', 'PARCIAL', 'PAGADA'])],
  validate,
  asyncHandler(ctrl.registrarPago)
);

=======
/**
 * @swagger
 * /facturas/{id}:
 *   put:
 *     summary: Actualizar datos de una factura
 *     description: Solo permite actualizar facturas en estatus "Pendiente". No permite modificar los detalles ni el monto.
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_cliente:
 *                 type: integer
 *               estatus:
 *                 type: string
 *                 enum: [Pendiente, Pagada, Anulada]
 *     responses:
 *       200:
 *         description: Factura actualizada
 *       404:
 *         description: Factura no encontrada
 *       409:
 *         description: No se puede modificar una factura anulada
 */
router.put(
  '/:id',
  authorize('recepcionista', 'administrador'),
  [
    param('id').isInt(),
    body('id_cliente').optional().isInt(),
    body('estatus').optional().isIn(['Pendiente', 'Pagada', 'Anulada']).withMessage('Estatus inválido'),
  ],
  validate,
  asyncHandler(ctrl.actualizar)
);

/**
 * @swagger
 * /facturas/{id}/estatus:
 *   patch:
 *     summary: Cambiar el estatus de una factura
 *     description: |
 *       - Al marcar como **Pagada**: se cierran las cuentas por cobrar asociadas.
 *       - Al marcar como **Anulada**: se devuelve el stock de materiales y se inactivan las cuentas por cobrar.
 *     tags: [Facturas]
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
 *                 enum: [Pendiente, Pagada, Anulada]
 *     responses:
 *       200:
 *         description: Estatus actualizado
 *       409:
 *         description: La factura ya está anulada
 */
router.patch(
  '/:id/estatus',
  authorize('recepcionista', 'administrador'),
  [
    param('id').isInt(),
    body('estatus')
      .isIn(['Pendiente', 'Pagada', 'Anulada'])
      .withMessage('Estatus inválido. Valores permitidos: Pendiente, Pagada, Anulada'),
  ],
  validate,
  asyncHandler(ctrl.cambiarEstatus)
);

/**
 * @swagger
 * /facturas/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) una factura
 *     description: |
 *       Soft delete. Solo permitido si la factura está en estatus **"Pendiente"**.
 *       Al eliminar se devuelve el stock de materiales y se inactivan las cuentas por cobrar.
 *     tags: [Facturas]
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
 *         description: Factura eliminada exitosamente
 *       404:
 *         description: Factura no encontrada
 *       409:
 *         description: Solo se pueden eliminar facturas en estatus Pendiente
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
 *     FacturaDetalle:
 *       type: object
 *       properties:
 *         id_detalle:
 *           type: integer
 *         id_factura:
 *           type: integer
 *         id_material:
 *           type: integer
 *           nullable: true
 *         cantidad:
 *           type: integer
 *         precio_unitario:
 *           type: number
 *         valor_impuesto:
 *           type: number
 *         subtotal_item:
 *           type: number
 *         estado:
 *           type: boolean
 *         materiales_repuestos:
 *           type: object
 *           nullable: true
 *     Factura:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         otId:
 *           type: integer
 *           nullable: true
 *         id_cliente:
 *           type: integer
 *           nullable: true
 *         fecha:
 *           type: string
 *           format: date-time
 *         subtotal:
 *           type: number
 *           format: decimal
 *         total_impuestos:
 *           type: number
 *           format: decimal
 *         total:
 *           type: number
 *           format: decimal
 *         estatus:
 *           type: string
 *           enum: [Pendiente, Pagada, Anulada]
 *         estado:
 *           type: boolean
 *         factura_detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FacturaDetalle'
 *         clientes:
 *           type: object
 *           nullable: true
 *         ordenTrabajo:
 *           type: object
 *           nullable: true
 *         cuentas_por_cobrar:
 *           type: array
 *           items:
 *             type: object
 */

>>>>>>> feature/ordenes-trabajo
module.exports = router;
