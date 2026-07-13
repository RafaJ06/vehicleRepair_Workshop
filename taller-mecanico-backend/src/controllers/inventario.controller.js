<<<<<<< HEAD
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// GET /api/inventario?bajoStock=true
async function listar(req, res) {
  const { bajoStock } = req.query;
  const materiales = await prisma.material.findMany({ orderBy: { nombre: 'asc' } });

  const data = bajoStock === 'true' ? materiales.filter((m) => m.stock <= m.stockMinimo) : materiales;
  res.json(data);
=======

const prisma = require("../config/prisma");

const ApiError = require("../utils/ApiError");

// GET /api/inventario
async function listar(req, res) {
    const materiales = await prisma.materiales_repuestos.findMany({
        include: {
            impuestos: true,
        },
        orderBy: {
            nombre: "asc",
        },
    });

    res.json(materiales);
>>>>>>> origin/development
}

// GET /api/inventario/:id
async function obtener(req, res) {
<<<<<<< HEAD
  const id = Number(req.params.id);
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) throw ApiError.notFound('Material no encontrado.');
  res.json(material);
=======
    const id = Number(req.params.id);

    const material = await prisma.materiales_repuestos.findUnique({
        where: {
            id_material: id,
        },
        include: {
            impuestos: true,
        },
    });

    if (!material)
        throw ApiError.notFound("Material no encontrado.");

    res.json(material);
>>>>>>> origin/development
}

// POST /api/inventario
async function crear(req, res) {
<<<<<<< HEAD
  const { nombre, descripcion, precioUnitario, stock, stockMinimo } = req.body;
  const material = await prisma.material.create({
    data: {
      nombre,
      descripcion,
      precioUnitario,
      stock: stock ?? 0,
      stockMinimo: stockMinimo ?? 0,
    },
  });
  res.status(201).json(material);
=======

    const {
        nombre,
        precio_unitario,
        id_impuesto,
        stock,
        estatus,
        estado,
    } = req.body;

    if (id_impuesto) {

        const impuesto = await prisma.impuestos.findUnique({
            where: {
                id_impuesto,
            },
        });

        if (!impuesto)
            throw ApiError.badRequest("El impuesto seleccionado no existe.");
    }

    const material = await prisma.materiales_repuestos.create({
        data: {
            nombre,
            precio_unitario,
            id_impuesto,
            stock: stock ?? 0,
            estatus: estatus ?? "Disponible",
            estado: estado ?? true,
        },
        include: {
            impuestos: true,
        },
    });

    res.status(201).json(material);
>>>>>>> origin/development
}

// PUT /api/inventario/:id
async function actualizar(req, res) {
<<<<<<< HEAD
  const id = Number(req.params.id);
  const { nombre, descripcion, precioUnitario, stockMinimo } = req.body;
  const material = await prisma.material.update({
    where: { id },
    data: { nombre, descripcion, precioUnitario, stockMinimo },
  });
  res.json(material);
}

// PATCH /api/inventario/:id/ajustar-stock  (entradas de mercancia, ajustes manuales)
async function ajustarStock(req, res) {
  const id = Number(req.params.id);
  const { cantidad } = req.body; // puede ser negativo o positivo

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) throw ApiError.notFound('Material no encontrado.');

  const nuevoStock = material.stock + Number(cantidad);
  if (nuevoStock < 0) throw ApiError.badRequest('El ajuste dejaria el stock en negativo.');

  const actualizado = await prisma.material.update({ where: { id }, data: { stock: nuevoStock } });
  res.json(actualizado);
}

module.exports = { listar, obtener, crear, actualizar, ajustarStock };
=======

    const id = Number(req.params.id);

    const {
        nombre,
        precio_unitario,
        id_impuesto,
        stock,
        estatus,
        estado,
    } = req.body;

    const existe = await prisma.materiales_repuestos.findUnique({
        where: {
            id_material: id,
        },
    });

    if (!existe)
        throw ApiError.notFound("Material no encontrado.");

    if (id_impuesto) {

        const impuesto = await prisma.impuestos.findUnique({
            where: {
                id_impuesto,
            },
        });

        if (!impuesto)
            throw ApiError.badRequest("El impuesto seleccionado no existe.");
    }

    const actualizado = await prisma.materiales_repuestos.update({

        where: {
            id_material: id,
        },

        data: {
            nombre,
            precio_unitario,
            id_impuesto,
            stock,
            estatus,
            estado,
        },

        include: {
            impuestos: true,
        },

    });

    res.json(actualizado);
}

// PATCH /api/inventario/:id/ajustar-stock
async function ajustarStock(req, res) {

    const id = Number(req.params.id);

    const { cantidad } = req.body;

    const material = await prisma.materiales_repuestos.findUnique({
        where: {
            id_material: id,
        },
    });

    if (!material)
        throw ApiError.notFound("Material no encontrado.");

    const nuevoStock = material.stock + Number(cantidad);

    if (nuevoStock < 0)
        throw ApiError.badRequest("El stock no puede quedar negativo.");

    const actualizado = await prisma.materiales_repuestos.update({

        where: {
            id_material: id,
        },

        data: {
            stock: nuevoStock,
        },

        include: {
            impuestos: true,
        },

    });

    res.json(actualizado);
}

module.exports = {
    listar,
    obtener,
    crear,
    actualizar,
    ajustarStock,
};
>>>>>>> origin/development
