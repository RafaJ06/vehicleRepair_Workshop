const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API - Taller Mecanico',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:4000/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Cliente: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            email: { type: 'string' },
          },
        },
        // ... agrega aqui el resto de tus objetos (Vehiculo, OrdenTrabajo, etc.)
      },
    },
    security: [{ bearerAuth: [] }], // aplica el candado a todas las rutas por defecto
  },
  apis: ['./src/routes/*.js'], // donde swagger-jsdoc va a buscar los comentarios @swagger
};

module.exports = swaggerJsdoc(options);