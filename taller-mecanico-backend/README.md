# Backend - Sistema de Gestion de Taller Mecanico

API REST construida con **Node.js + Express**, **Prisma ORM** sobre **PostgreSQL (Supabase)**,
pensada para correr detras de **Nginx** como proxy inverso. El frontend se desarrolla por separado
y consume esta API vía `/api/...`.

## 1. Estructura del proyecto

```
taller-mecanico-backend/
├── prisma/
│   ├── schema.prisma       # Modelo de datos (propuesta inicial, ver seccion 3)
│   └── seed.js             # Crea los roles base (recepcionista, mecanico, supervisor, administrador)
├── src/
│   ├── app.js               # Configuracion de Express (middlewares, rutas, error handler)
│   ├── server.js             # Punto de entrada (levanta el servidor HTTP)
│   ├── config/prisma.js      # Cliente Prisma singleton
│   ├── routes/                # Un archivo de rutas por modulo funcional (RF-01 a RF-09)
│   ├── controllers/           # Logica de negocio de cada modulo
│   ├── middlewares/           # auth (JWT + roles), validate, errorHandler
│   └── utils/                 # asyncHandler, ApiError
├── nginx/taller-mecanico.conf # Config de referencia para el proxy inverso
├── .env.example
└── package.json
```

Cada modulo de rutas corresponde a un requisito funcional del SRS:

| Modulo               | Requisito  | Endpoint base            |
|----------------------|------------|---------------------------|
| Autenticacion/Usuarios | RF-08    | `/api/auth`, `/api/usuarios` |
| Clientes             | RF-01      | `/api/clientes`            |
| Vehiculos            | RF-02      | `/api/vehiculos`           |
| Ordenes de Trabajo   | RF-03      | `/api/ordenes-trabajo`     |
| Diagnostico          | RF-04      | `/api/diagnosticos`        |
| Inventario           | RF-05      | `/api/inventario`          |
| Facturacion          | RF-06      | `/api/facturas`            |
| Agenda de Citas      | RF-07      | `/api/citas`               |
| Reportes             | RF-09      | `/api/reportes`            |

RF-10 (Historial de Mantenimiento) se resuelve consultando `GET /api/vehiculos/:id`, que
incluye todas sus ordenes de trabajo, diagnosticos y facturas.

## 2. Instalacion local

```bash
npm install
cp .env.example .env      # completar con los datos reales de Supabase
```

## 3. Base de datos (Supabase ya existe)

El `schema.prisma` incluido es una **propuesta** derivada del SRS, normalizada a 3FN
(se agregaron las tablas `roles`, `usuarios`, `sucursales`, `citas` y `detalle_facturas`
que el SRS exige pero no detalla). Como la base **ya fue creada en Supabase**, sincroniza
antes de programar:

```bash
# Trae el esquema REAL desde Supabase y sobrescribe prisma/schema.prisma
npx prisma db pull

# Genera el cliente de Prisma a partir del esquema resultante
npx prisma generate
```

Si los nombres de columnas/tablas de Supabase difieren de los usados en los controladores
(camelCase en Prisma, snake_case via `@map`), ajusta los `@map(...)` en `schema.prisma` o
los nombres de campo en los controladores para que coincidan.

Si en cambio la base estuviera vacia y prefieres partir de este diseño:

```bash
npx prisma migrate dev --name init
node prisma/seed.js     # crea los 4 roles base
```

**Importante (Supabase):** usa la cadena de *Connection Pooling* (puerto 6543, `pgbouncer=true`)
en `DATABASE_URL` para el runtime de la app, y la cadena *directa* (puerto 5432) en `DIRECT_URL`
solo para migraciones/introspeccion. Ambas variables ya estan contempladas en `.env.example`.

## 4. Ejecutar en desarrollo

```bash
npm run dev
# API disponible en http://localhost:4000/api
# Health check:      http://localhost:4000/api/health
```

## 5. Reglas de negocio ya implementadas

- **No se puede cerrar una OT sin factura** y sin que esta este `PAGADA`
  (`ordenesTrabajo.controller.js -> cambiarEstado`).
- **No se puede entregar un vehiculo con pagos pendientes**: la misma validacion aplica
  al pasar el estado a `CERRADA`.
- **Cada vehiculo pertenece a un cliente**: se valida al crear el vehiculo y al crear la OT.
- **El inventario se descuenta automaticamente** al facturar repuestos
  (`facturas.controller.js -> crear`, usando una transaccion de Prisma `$transaction`).

## 6. Autenticacion y permisos (RF-08)

- `POST /api/auth/login` devuelve un JWT.
- El resto de rutas requieren header `Authorization: Bearer <token>`.
- Los roles disponibles son: `recepcionista`, `mecanico`, `supervisor`, `administrador`.
  Cada ruta usa `authorize(...)` para restringir por rol donde aplica.
- Solo un administrador autenticado puede crear nuevas cuentas (`POST /api/auth/registro`).

## 7. Despliegue con Nginx

1. Instalar dependencias y variables de entorno en el servidor.
2. Correr la API con un manejador de procesos (recomendado: **PM2**):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name taller-mecanico-api
   pm2 save
   ```
3. Copiar `nginx/taller-mecanico.conf` a `/etc/nginx/sites-available/` y enlazar:
   ```bash
   sudo ln -s /etc/nginx/sites-available/taller-mecanico.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
4. Ajustar `server_name` y las rutas de certificados SSL en el archivo de configuracion.
5. Configurar `CORS_ORIGIN` en `.env` con el dominio real donde vive el frontend.

## 8. Proximos pasos sugeridos

- Añadir tests (Jest + Supertest) para los controladores de reglas de negocio criticas.
- Documentar la API con Swagger/OpenAPI (`swagger-jsdoc` + `swagger-ui-express`).
- Si se implementa alguna integracion opcional (WhatsApp o facturacion electronica),
  agregar un modulo `src/services/` para aislar el cliente externo del controlador.
- Revisar los `enum` de Prisma (`EstadoOrden`, `EstadoPago`, `EstadoCita`) contra los
  valores reales que ya existan en la base de Supabase tras el `db pull`.
