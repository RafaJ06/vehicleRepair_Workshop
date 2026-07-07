// Ejecutar con: node prisma/seed.js
// Crea los roles base necesarios para RF-08 (Gestion de Usuarios)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROLES = ['recepcionista', 'mecanico', 'supervisor', 'administrador'];

async function main() {
  for (const nombre of ROLES) {
    await prisma.rol.create({
      
      
      data: {
        nombre: nombre,
      },
    
    });
  }
  console.log('Roles base creados/verificados:', ROLES.join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
