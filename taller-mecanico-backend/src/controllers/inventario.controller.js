
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
}

// GET /api/inventario/:id
async function obtener(req, res) {
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
}

// POST /api/inventario
async function crear(req, res) {

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
}

// PUT /api/inventario/:id
async function actualizar(req, res) {

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