// Ejecutar con: node prisma/seed.js
// Crea los roles base (RF-08) y un usuario administrador semilla, para poder
// hacer el primer login y desde ahi crear al resto de usuarios via /api/auth/registro.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const ROLES = ['recepcionista', 'mecanico', 'supervisor', 'administrador'];

async function main() {
  for (const nombre of ROLES) {
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log('Roles base creados/verificados:', ROLES.join(', '));

  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: 'administrador' } });
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@taller.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin12345!';

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(`El usuario administrador (${email}) ya existia, no se toco.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.usuario.create({
    data: { nombre: 'Administrador', email, passwordHash, rolId: rolAdmin.id },
  });

  console.log('--------------------------------------------------');
  console.log('Usuario administrador semilla creado. Usalo para el primer login:');
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log('Cambia esta contraseña (o borra este usuario) antes de produccion.');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
