require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// nginx ya termina TLS y actua como proxy inverso -> confiar en sus headers (X-Forwarded-*)
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use('/api', apiRoutes);

// 404 para rutas no encontradas dentro de /api
app.use('/api', (req, res, next) => next(ApiError.notFound('Ruta no encontrada.')));

// Manejador central de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
