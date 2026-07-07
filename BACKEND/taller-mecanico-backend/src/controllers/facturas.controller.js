const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const include = { detalles: { include: { material: true } }, ordenTrabajo: true };

// GET /api/facturas?otId=
async function listar(req, res) {
  const { otId } = req.query;
  const where = otId ? { otId: Number(otId) } : {};
  const facturas = await prisma.factura.findMany({ where, include, orderBy: { fecha: 'desc' } });
  res.json(facturas);
}

// GET /api/facturas/:id
async function obtener(req, res) {
  const id = Number(req.params.id);
  const factura = await prisma.factura.findUnique({ where: { id }, include });
  if (!factura) throw ApiError.notFound('Factura no encontrada.');
  res.json(factura);
}

// POST /api/facturas -> CU-03 Facturar Servicio
// body: { otId, formaPago, items: [{ materialId?, descripcion, cantidad, precioUnitario }] }
// Regla de negocio: "el inventario se descontara automaticamente" al agregar piezas con materialId.
async function crear(req, res) {
  const { otId, formaPago, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('Debe incluir al menos un item (servicio o repuesto).');
  }

  const orden = await prisma.ordenTrabajo.findUnique({ where: { id: Number(otId) } });
  if (!orden) throw ApiError.badRequest('La orden de trabajo indicada no existe.');

  const factura = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const detallesData = [];

    for (const item of items) {
      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(item.precioUnitario);
      const totalLinea = cantidad * precioUnitario;
      subtotal += totalLinea;

      if (item.materialId) {
        const material = await tx.material.findUnique({ where: { id: Number(item.materialId) } });
        if (!material) throw ApiError.badRequest(`El material ${item.materialId} no existe.`);
        if (material.stock < cantidad) {
          throw ApiError.conflict(`Stock insuficiente para "${material.nombre}" (disponible: ${material.stock}).`);
        }
        // Descuento automatico de inventario (regla de negocio)
        await tx.material.update({
          where: { id: material.id },
          data: { stock: { decrement: cantidad } },
        });
      }

      detallesData.push({
        materialId: item.materialId ? Number(item.materialId) : null,
        descripcion: item.descripcion,
        cantidad,
        precioUnitario,
        total: totalLinea,
      });
    }

    const impuesto = Number((subtotal * 0.18).toFixed(2)); // ITBIS 18% (ajustable segun pais)
    const total = Number((subtotal + impuesto).toFixed(2));

    return tx.factura.create({
      data: {
        otId: Number(otId),
        formaPago,
        subtotal,
        impuesto,
        total,
        detalles: { create: detallesData },
      },
      include,
    });
  });

  res.status(201).json(factura);
}

// PATCH /api/facturas/:id/pago  -> registrar pago / cambiar estadoPago
async function registrarPago(req, res) {
  const id = Number(req.params.id);
  const { estadoPago } = req.body; // PENDIENTE | PARCIAL | PAGADA

  const factura = await prisma.factura.update({ where: { id }, data: { estadoPago }, include });
  res.json(factura);
}

module.exports = { listar, obtener, crear, registrarPago };
