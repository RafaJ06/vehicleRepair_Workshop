const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');


const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesion
 *     tags: [Autenticacion]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@taller.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin12345!
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 cliente:
 *                   $ref: '#/components/schemas/Cliente'
 *       401:
 *         description: Credenciales invalidas
 */
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  asyncHandler(ctrl.login)
);

// Solo un administrador ya autenticado puede crear nuevas cuentas
/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Crear 
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Cliente' }
 */
router.post(
  '/registro',
  verifyToken,
  authorize('administrador'),
  [
    body('nombre').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }).withMessage('password debe tener al menos 8 caracteres'),
    body('rolID').isIn([6, 7, 8, 9]),
  ],
  validate,
  asyncHandler(ctrl.registro)
);

router.get('/perfil', verifyToken, asyncHandler(ctrl.perfil));

module.exports = router;
