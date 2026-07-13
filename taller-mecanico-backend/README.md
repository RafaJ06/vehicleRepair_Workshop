# Backend - Sistema de Gestion de Taller Mecanico

API REST construida con **Node.js + Express**, **Prisma ORM** sobre **PostgreSQL (Supabase)**,
pensada para correr detras de **Nginx** como proxy inverso. El frontend se desarrolla por separado
y consume esta API vía `/api/...`.

## 1. Estructura del proyecto

```
taller-mecanico-backend/
├── prisma/
<<<<<<< HEAD
│   ├── schema.prisma       # Modelo de datos (propuesta inicial, ver seccion 3)
=======
│   ├── schema.prisma       # Modelo de datos (propuesta inicial, ver seccion 4)
>>>>>>> origin/development
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

<<<<<<< HEAD
## 2. Instalacion local
=======
## 2. Version de Prisma (importante)

El proyecto fija `prisma` y `@prisma/client` en **6.19.2** en `package.json`, en vez de
usar `^7.x` o "latest". El motivo: **Prisma ORM v7** (lanzado en noviembre 2025) eliminó
los campos `url` y `directUrl` del bloque `datasource` en `schema.prisma`; esa configuracion
ahora vive en un archivo nuevo `prisma.config.ts`, y ademas Prisma Client v7 requiere un
"driver adapter" (`@prisma/adapter-pg`, etc.) incluso para PostgreSQL. Este cambio rompio
justamente el patron pooler + conexion directa que Supabase recomienda dentro del schema
(hay un issue abierto al respecto en el repo de Supabase).

Mientras el proyecto se quede en 6.x, `schema.prisma` sigue funcionando tal cual esta en este
repo (con `url = env("DATABASE_URL")` y `directUrl = env("DIRECT_URL")` dentro del propio
`datasource db { ... }`), sin necesidad de `prisma.config.ts` ni driver adapters.

Si en el futuro el equipo decide migrar a Prisma 7, hay que:
1. Crear `prisma.config.ts` y mover ahi `url`/`directUrl`.
2. Instalar `@prisma/adapter-pg` y pasar el adapter al construir `PrismaClient`.
3. Revisar la [guía oficial de migracion a v7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

Por ahora, para instalar exactamente estas versiones:

```bash
npm install prisma@6.19.2 @prisma/client@6.19.2 --save-exact
```

## 3. Instalacion local
>>>>>>> origin/development

```bash
npm install
cp .env.example .env      # completar con los datos reales de Supabase
```

<<<<<<< HEAD
## 3. Base de datos (Supabase ya existe)
=======
## 4. Base de datos (Supabase ya existe)
>>>>>>> origin/development

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

<<<<<<< HEAD
## 4. Ejecutar en desarrollo
=======
## 5. Ejecutar en desarrollo
>>>>>>> origin/development

```bash
npm run dev
# API disponible en http://localhost:4000/api
# Health check:      http://localhost:4000/api/health
```

<<<<<<< HEAD
## 5. Reglas de negocio ya implementadas
=======
## 6. Reglas de negocio ya implementadas
>>>>>>> origin/development

- **No se puede cerrar una OT sin factura** y sin que esta este `PAGADA`
  (`ordenesTrabajo.controller.js -> cambiarEstado`).
- **No se puede entregar un vehiculo con pagos pendientes**: la misma validacion aplica
  al pasar el estado a `CERRADA`.
- **Cada vehiculo pertenece a un cliente**: se valida al crear el vehiculo y al crear la OT.
- **El inventario se descuenta automaticamente** al facturar repuestos
  (`facturas.controller.js -> crear`, usando una transaccion de Prisma `$transaction`).

<<<<<<< HEAD
## 6. Autenticacion y permisos (RF-08)
=======
## 7. Autenticacion y permisos (RF-08)
>>>>>>> origin/development

- `POST /api/auth/login` devuelve un JWT.
- El resto de rutas requieren header `Authorization: Bearer <token>`.
- Los roles disponibles son: `recepcionista`, `mecanico`, `supervisor`, `administrador`.
  Cada ruta usa `authorize(...)` para restringir por rol donde aplica.
- Solo un administrador autenticado puede crear nuevas cuentas (`POST /api/auth/registro`).

<<<<<<< HEAD
## 7. Despliegue con Nginx
=======
## 8. Despliegue

Hay dos escenarios posibles; usa el que aplique a tu caso.

### 8.a Node corriendo en tu propia VM/VPS (Nginx local)
>>>>>>> origin/development

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

<<<<<<< HEAD
## 8. Proximos pasos sugeridos
=======
### 8.b Backend en Render + Nginx como proxy (tu caso actual)

El codigo de `src/` no necesita cambios: `server.js` ya escucha en `process.env.PORT`,
que es justo la variable que Render inyecta (por defecto 10000). Lo que sí cambia es
`nginx.conf`: ya no apunta a `127.0.0.1:4000` (ahi no corre nada), sino a la URL publica
que Render te asigna. Usa **`nginx/taller-mecanico-render.conf`** en vez del archivo anterior.

**En el dashboard de Render, al crear el Web Service:**

| Campo              | Valor |
|---------------------|-------|
| Build Command        | `npm install && npx prisma generate` |
| Start Command         | `npm start` (equivale a `node src/server.js`) |
| Environment Variables | `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (los mismos nombres de `.env.example`; Render no lee tu `.env`, hay que cargarlos a mano en su panel) |

No definas `PORT` manualmente en Render: el la inyecta sola y tu codigo ya la respeta.

**En `nginx/taller-mecanico-render.conf`:**
- Reemplaza `taller-mecanico-api.onrender.com` por el hostname real que te dio Render.
- Nota los dos detalles que rompen si se omiten al proxyar hacia un PaaS multi-tenant:
  `proxy_ssl_server_name on;` (para el SNI/TLS) y `proxy_set_header Host <hostname-de-render>;`
  (Render enruta por Host header; si le mandas tu propio dominio ahi, no sabra a que
  servicio entregar la peticion).

**Dos cosas a revisar antes de usar esto en produccion/entrega:**

1. **Cold starts en el plan gratuito de Render.** Tras ~15 min sin trafico el servicio
   se duerme; el primer request que llega después puede tardar 30-60s en responder.
   Esto **incumple directamente el RNF del SRS** ("tiempo de respuesta menor a 3 segundos").
   Si es solo para pruebas/entrega esta bien, pero para cumplir ese requisito en serio
   necesitas al menos el plan de pago mas basico de Render (evita que el servicio se duerma).
2. **`trust proxy` con dos saltos.** Ahora la cadena real es
   `navegador -> tu Nginx -> proxy interno de Render -> tu app`. En `src/app.js` esta
   `app.set('trust proxy', 1)`, pensado para un solo proxy delante (tu Nginx). Con Render
   de por medio hay un salto adicional; si te importa que `req.ip` refleje la IP real del
   cliente (logs, rate limiting), cambia ese valor a `2`.

### 8.c (Opcional) Servir el frontend desde el mismo Nginx

Si tu Nginx tambien sirve los archivos estaticos del frontend ya compilado, todo queda
bajo el mismo dominio y el navegador nunca ve un origen distinto — en ese caso `CORS_ORIGIN`
en el backend deja de ser relevante para las llamadas del navegador (solo importaria si
alguien llama a la API directamente desde otro origen).

## 9. Proximos pasos sugeridos
>>>>>>> origin/development

- Añadir tests (Jest + Supertest) para los controladores de reglas de negocio criticas.
- Documentar la API con Swagger/OpenAPI (`swagger-jsdoc` + `swagger-ui-express`).
- Si se implementa alguna integracion opcional (WhatsApp o facturacion electronica),
  agregar un modulo `src/services/` para aislar el cliente externo del controlador.
- Revisar los `enum` de Prisma (`EstadoOrden`, `EstadoPago`, `EstadoCita`) contra los
  valores reales que ya existan en la base de Supabase tras el `db pull`.
