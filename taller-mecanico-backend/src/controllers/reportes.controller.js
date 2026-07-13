const prisma = require('../config/prisma');

// GET /api/reportes/ordenes-por-estado
async function ordenesPorEstado(req, res) {
  const resultado = await prisma.ordenTrabajo.groupBy({
    by: ['estado'],
    _count: { _all: true },
  });
  res.json(resultado.map((r) => ({ estado: r.estado, total: r._count._all })));
}

// GET /api/reportes/facturacion?desde=&hasta=
async function facturacionPorPeriodo(req, res) {
  const { desde, hasta } = req.query;
  const where = {
    ...(desde || hasta
      ? {
          fecha: {
            ...(desde && { gte: new Date(desde) }),
            ...(hasta && { lte: new Date(hasta) }),
          },
        }
      : {}),
  };

  const facturas = await prisma.factura.findMany({ where });
  const totalFacturado = facturas.reduce((acc, f) => acc + Number(f.total), 0);
  const totalPendiente = facturas
    .filter((f) => f.estadoPago !== 'PAGADA')
    .reduce((acc, f) => acc + Number(f.total), 0);

  res.json({
    cantidadFacturas: facturas.length,
    totalFacturado,
    totalPendiente,
  });
}

// GET /api/reportes/inventario-bajo-stock
async function inventarioBajoStock(req, res) {
  const materiales = await prisma.material.findMany();
  const bajoStock = materiales.filter((m) => m.stock <= m.stockMinimo);
  res.json(bajoStock);
}

// GET /api/reportes/clientes-frecuentes
async function clientesFrecuentes(req, res) {
  const resultado = await prisma.ordenTrabajo.groupBy({
    by: ['clienteId'],
    _count: { _all: true },
    orderBy: { _count: { clienteId: 'desc' } },
    take: 10,
  });

  const clientes = await prisma.cliente.findMany({
    where: { id: { in: resultado.map((r) => r.clienteId) } },
    select: { id: true, nombre: true },
  });

  const data = resultado.map((r) => ({
    cliente: clientes.find((c) => c.id === r.clienteId),
    totalOrdenes: r._count._all,
  }));

  res.json(data);
}

module.exports = { ordenesPorEstado, facturacionPorPeriodo, inventarioBajoStock, clientesFrecuentes };
