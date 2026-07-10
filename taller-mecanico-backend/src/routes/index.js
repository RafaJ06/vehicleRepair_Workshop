const { Router } = require('express');

const authRoutes = require('./auth.routes');
const usuariosRoutes = require('./usuarios.routes');
const clientesRoutes = require('./clientes.routes');
const vehiculosRoutes = require('./vehiculos.routes');
const ordenesTrabajoRoutes = require('./ordenesTrabajo.routes');
const diagnosticosRoutes = require('./diagnosticos.routes');
const inventarioRoutes = require('./inventario.routes');
const facturasRoutes = require('./facturas.routes');
const citasRoutes = require('./citas.routes');
const reportesRoutes = require('./reportes.routes');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/vehiculos', vehiculosRoutes);
router.use('/ordenes-trabajo', ordenesTrabajoRoutes);
router.use('/diagnosticos', diagnosticosRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/facturas', facturasRoutes);
router.use('/citas', citasRoutes);
router.use('/reportes', reportesRoutes);

module.exports = router;
