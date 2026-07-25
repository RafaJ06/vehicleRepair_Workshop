const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// Relaciones siempre incluidas en respuestas de factura
const include = {
  factura_detalles: {
    include: {
      materiales_repuestos: {
        select: { id_material: true, nombre: true, precio_unitario: true },
      },
    },
  },
  factura_diagnostico_puente: {
    include: {
      diagnosticos: {
        select: { id: true, fallaDetectada: true, estatus: true },
      },
    },
  },
  clientes: {
    select: { id: true, nombre: true, identificacion: true, email: true, telefono: true },
  },
  ordenTrabajo: {
    select: { id: true, estatus: true, fecha_creacion: true, fechaCierre: true },
  },
  cuentas_por_cobrar: true,
};

// Valores válidos para estatus de factura
const ESTATUS_FACTURA = ['Pendiente', 'Pagada', 'Anulada'];

// ─────────────────────────────────────────────
// GET /api/facturas
// Query params: otId, clienteId, estatus, page, limit
// ─────────────────────────────────────────────
async function listar(req, res) {
  const { otId, clienteId, estatus, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    estado: true,
    ...(otId && { otId: Number(otId) }),
    ...(clienteId && { id_cliente: Number(clienteId) }),
    ...(estatus && { estatus }),
  };

  const [data, total] = await Promise.all([
    prisma.factura.findMany({
      where,
      include,
      orderBy: { fecha: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.factura.count({ where }),
  ]);

  res.json({ data, total, page: Number(page), limit: Number(limit) });
}

// ─────────────────────────────────────────────
// GET /api/facturas/:id
// ─────────────────────────────────────────────
async function obtener(req, res) {
  const id = Number(req.params.id);

  const factura = await prisma.factura.findFirst({
    where: { id, estado: true },
    include,
  });

  if (!factura) throw ApiError.notFound('Factura no encontrada.');
  res.json(factura);
}

// ─────────────────────────────────────────────
// POST /api/facturas
// Crea una factura asociada a una OT.
// Reglas de negocio:
//   - La OT debe existir y estar activa
//   - No puede tener otra factura activa ya creada
//   - Al agregar detalles con id_material se valida stock y se descuenta automáticamente
//   - Se crea automáticamente una cuenta por cobrar si el estatus es "Pendiente"
//
// body: {
//   otId,
//   id_cliente,
//   estatus?,           // "Pendiente" (default) | "Pagada"
//   detalles: [{ id_material?, cantidad, precio_unitario, valor_impuesto }],
//   diagnosticos?: [id_diagnostico]   // IDs de diagnósticos a vincular
// }
// ─────────────────────────────────────────────
async function crear(req, res) {
  const { otId, id_cliente, estatus = 'Pendiente', detalles, diagnosticos = [] } = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw ApiError.badRequest('Debe incluir al menos un detalle en la factura.');
  }

  // Verificar OT
  const orden = await prisma.ordenTrabajo.findFirst({
    where: { id: Number(otId), estado: true },
    include: { facturas: true },
  });
  if (!orden) throw ApiError.badRequest('La orden de trabajo indicada no existe o está inactiva.');
  if (orden.facturas && orden.facturas.estado) {
    throw ApiError.conflict('La orden de trabajo ya tiene una factura activa asociada.');
  }

  // Verificar cliente si se envía
  if (id_cliente) {
    const cliente = await prisma.cliente.findFirst({ where: { id: Number(id_cliente), estado: true } });
    if (!cliente) throw ApiError.badRequest('El cliente indicado no existe o está inactivo.');
  }

  // Verificar estatus
  if (!ESTATUS_FACTURA.includes(estatus)) {
    throw ApiError.badRequest(`Estatus inválido. Valores permitidos: ${ESTATUS_FACTURA.join(', ')}`);
  }

  // Ejecutar todo en una transacción
  const factura = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    let total_impuestos = 0;
    const detallesData = [];

    for (const item of detalles) {
      const cantidad = Number(item.cantidad);
      const precio_unitario = Number(item.precio_unitario);
      const valor_impuesto = Number(item.valor_impuesto ?? 0);
      const subtotal_item = cantidad * precio_unitario;

      if (item.id_material) {
        const material = await tx.materiales_repuestos.findUnique({
          where: { id_material: Number(item.id_material) },
        });
        if (!material) throw ApiError.badRequest(`El material con id ${item.id_material} no existe.`);
        if (material.stock < cantidad) {
          throw ApiError.conflict(
            `Stock insuficiente para "${material.nombre}" (disponible: ${material.stock}, solicitado: ${cantidad}).`
          );
        }
        // Descuento automático de inventario
        await tx.materiales_repuestos.update({
          where: { id_material: material.id_material },
          data: { stock: { decrement: cantidad } },
        });
      }

      subtotal += subtotal_item;
      total_impuestos += valor_impuesto * cantidad;

      detallesData.push({
        id_material: item.id_material ? Number(item.id_material) : null,
        cantidad,
        precio_unitario,
        valor_impuesto,
        subtotal_item,
      });
    }

    const total = Number((subtotal + total_impuestos).toFixed(2));
    subtotal = Number(subtotal.toFixed(2));
    total_impuestos = Number(total_impuestos.toFixed(2));

    // Crear la factura con sus detalles
    const nuevaFactura = await tx.factura.create({
      data: {
        otId: Number(otId),
        id_cliente: id_cliente ? Number(id_cliente) : null,
        subtotal,
        total_impuestos,
        total,
        estatus,
        factura_detalles: { create: detallesData },
        // Vincular diagnósticos si se envían
        ...(diagnosticos.length > 0 && {
          factura_diagnostico_puente: {
            create: diagnosticos.map((idDx) => ({ id_diagnostico: Number(idDx) })),
          },
        }),
      },
      include,
    });

    // Crear cuenta por cobrar automáticamente si la factura queda pendiente
    if (estatus === 'Pendiente') {
      await tx.cuentas_por_cobrar.create({
        data: {
          id_factura: nuevaFactura.id,
          monto_total: total,
          monto_pagado: 0,
          monto_pendiente: total,
          estatus: 'Vigente',
        },
      });
    }

    return nuevaFactura;
  });

  res.status(201).json(factura);
}

// ─────────────────────────────────────────────
// PUT /api/facturas/:id
// Actualiza datos de una factura (solo si está en estatus "Pendiente")
// body: { id_cliente?, estatus?, detalles? }
// ─────────────────────────────────────────────
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const { id_cliente, estatus } = req.body;

  const facturaExistente = await prisma.factura.findFirst({
    where: { id, estado: true },
  });
  if (!facturaExistente) throw ApiError.notFound('Factura no encontrada.');

  if (facturaExistente.estatus === 'Anulada') {
    throw ApiError.conflict('No se puede modificar una factura anulada.');
  }

  if (estatus && !ESTATUS_FACTURA.includes(estatus)) {
    throw ApiError.badRequest(`Estatus inválido. Valores permitidos: ${ESTATUS_FACTURA.join(', ')}`);
  }

  if (id_cliente) {
    const cliente = await prisma.cliente.findFirst({ where: { id: Number(id_cliente), estado: true } });
    if (!cliente) throw ApiError.badRequest('El cliente indicado no existe o está inactivo.');
  }

  const factura = await prisma.factura.update({
    where: { id },
    data: {
      ...(id_cliente !== undefined && { id_cliente: id_cliente ? Number(id_cliente) : null }),
      ...(estatus && { estatus }),
    },
    include,
  });

  res.json(factura);
}

// ─────────────────────────────────────────────
// PATCH /api/facturas/:id/estatus
// Cambia el estatus de la factura.
// Reglas:
//   - Si se marca como "Pagada" y existe CXC, se actualiza a "Cancelada"
//   - Si se anula y hay stock descontado, se revierten los materiales
// body: { estatus }
// ─────────────────────────────────────────────
async function cambiarEstatus(req, res) {
  const id = Number(req.params.id);
  const { estatus } = req.body;

  if (!ESTATUS_FACTURA.includes(estatus)) {
    throw ApiError.badRequest(`Estatus inválido. Valores permitidos: ${ESTATUS_FACTURA.join(', ')}`);
  }

  const factura = await prisma.factura.findFirst({
    where: { id, estado: true },
    include: {
      factura_detalles: true,
      cuentas_por_cobrar: true,
    },
  });
  if (!factura) throw ApiError.notFound('Factura no encontrada.');

  if (factura.estatus === 'Anulada') {
    throw ApiError.conflict('La factura ya está anulada y no puede cambiar de estatus.');
  }

  await prisma.$transaction(async (tx) => {
    // Actualizar estatus de la factura
    await tx.factura.update({
      where: { id },
      data: { estatus },
    });

    // Si se marca como Pagada, cerrar la cuenta por cobrar
    if (estatus === 'Pagada') {
      for (const cxc of factura.cuentas_por_cobrar) {
        await tx.cuentas_por_cobrar.update({
          where: { id_cxc: cxc.id_cxc },
          data: {
            monto_pagado: cxc.monto_total,
            monto_pendiente: 0,
            estatus: 'Cancelada',
          },
        });
      }
    }

    // Si se anula, devolver stock de materiales
    if (estatus === 'Anulada') {
      for (const detalle of factura.factura_detalles) {
        if (detalle.id_material) {
          await tx.materiales_repuestos.update({
            where: { id_material: detalle.id_material },
            data: { stock: { increment: detalle.cantidad } },
          });
        }
      }
      // Inactivar las cuentas por cobrar asociadas
      for (const cxc of factura.cuentas_por_cobrar) {
        await tx.cuentas_por_cobrar.update({
          where: { id_cxc: cxc.id_cxc },
          data: { estado: false },
        });
      }
    }
  });

  const facturaActualizada = await prisma.factura.findFirst({
    where: { id },
    include,
  });

  res.json(facturaActualizada);
}

// ─────────────────────────────────────────────
// DELETE /api/facturas/:id  (soft delete)
// Solo se puede eliminar si está en estatus "Pendiente"
// ─────────────────────────────────────────────
async function eliminar(req, res) {
  const id = Number(req.params.id);

  const factura = await prisma.factura.findFirst({
    where: { id, estado: true },
    include: { factura_detalles: true, cuentas_por_cobrar: true },
  });
  if (!factura) throw ApiError.notFound('Factura no encontrada.');

  if (factura.estatus !== 'Pendiente') {
    throw ApiError.conflict('Solo se pueden eliminar facturas en estatus "Pendiente".');
  }

  await prisma.$transaction(async (tx) => {
    // Devolver stock de materiales
    for (const detalle of factura.factura_detalles) {
      if (detalle.id_material) {
        await tx.materiales_repuestos.update({
          where: { id_material: detalle.id_material },
          data: { stock: { increment: detalle.cantidad } },
        });
      }
    }

    // Inactivar cuentas por cobrar
    for (const cxc of factura.cuentas_por_cobrar) {
      await tx.cuentas_por_cobrar.update({
        where: { id_cxc: cxc.id_cxc },
        data: { estado: false },
      });
    }

    // Soft delete de la factura
    await tx.factura.update({
      where: { id },
      data: { estado: false },
    });
  });

  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstatus, eliminar };
