const prisma = require('../config/prisma');

// GET /api/reportes/ordenes-por-estado
async function ordenesPorEstado(req, res) {
  const resultado = await prisma.ordenTrabajo.groupBy({
    by: ["estatus"],
    _count: {
      _all: true,
    },
  });

  res.json(
    resultado.map((r) => ({
      estatus: r.estatus,
      total: r._count._all,
    }))
  );
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
  .filter((f) => f.estatus === "Pendiente")
  .reduce((acc, f) => acc + Number(f.total), 0);

  res.json({
    cantidadFacturas: facturas.length,
    totalFacturado,
    totalPendiente,
  });
}

// GET /api/reportes/inventario-bajo-stock
async function inventarioBajoStock(req, res) {
  const limite = Number(req.query.limite) || 5;

  const materiales = await prisma.materiales_repuestos.findMany({
    where: {
      stock: {
        lte: limite,
      },
    },
  });

  res.json(materiales);
}

// GET /api/reportes/clientes-frecuentes
async function clientesFrecuentes(req, res) {
  const clientes = await prisma.cliente.findMany({
    select: {
      id: true,
      nombre: true,
      clientes_vehiculos: {
        select: {
          id_vehiculo: true,
        },
      },
    },
  });

  const data = clientes
    .map((cliente) => ({
      id: cliente.id,
      nombre: cliente.nombre,
      totalVehiculos: cliente.clientes_vehiculos.length,
    }))
    .sort((a, b) => b.totalVehiculos - a.totalVehiculos)
    .slice(0, 10);

  res.json(data);
}


module.exports = { ordenesPorEstado, facturacionPorPeriodo, inventarioBajoStock, clientesFrecuentes };
