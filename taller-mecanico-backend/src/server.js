const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`API del Taller Mecanico corriendo en http://localhost:${PORT}/api`);
});

// Cierre ordenado: importante detras de nginx / en despliegues con reinicios
async function shutdown(signal) {
  console.log(`\nRecibida señal ${signal}. Cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Conexiones cerradas. Adios.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
