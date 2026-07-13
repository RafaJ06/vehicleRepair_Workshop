const { PrismaClient } = require('@prisma/client');

// Singleton: evita crear multiples instancias del cliente en desarrollo
// (nodemon recarga el modulo varias veces) y en runtime con supabase pooler.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;
