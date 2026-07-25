// Ejecutar con: node prisma/seed.js
// Crea los roles base necesarios para RF-08 (Gestion de Usuarios)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const ROLES = ['recepcionista', 'mecanico', 'supervisor', 'administrador'];

async function main() {
  // for (const nombre of ROLES) {
  //   await prisma.rol.create({
      
      
  //     data: {
  //       nombre: nombre,
  //     },
    
  //   });
  // }
 
  //console.log('Roles base creados/verificados:', ROLES.join(', '));
//   for (i = 2; i<6; i++){
// const variables = await prisma.rol.delete({where : { id: i}});
//   }

const variable = await prisma.rol.findMany();
 console.log(variable)
  //  const rolAdmin = await prisma.rol.findUnique({ where: { id: 9 } });
  // const email = process.env.SEED_ADMIN_EMAIL || 'admin@taller.com';
  // const password = process.env.SEED_ADMIN_PASSWORD || 'Admin12345!';

  // const existente = await prisma.usuario.findUnique({ where: { email } });
  // if (existente) {
  //   console.log(`El usuario administrador (${email}) ya existia, no se toco.`);
  //   return;
  // }

  // const contrasena_hash = await bcrypt.hash(password, 10);
  // await prisma.usuario.create({
  //   data: { nombre: 'Administrador', email, contrasena_hash, rolId: rolAdmin.id },
  // });

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
