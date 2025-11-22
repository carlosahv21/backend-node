// index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middlewares/errorHandlerMiddleware');
const knex = require('./config/knex');
const utilsCustomError = require('./utils/utilsCustomError');

// --- Importación de Rutas ---
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const blocksRoutes = require('./routes/blocks');
const classesRoutes = require('./routes/classes');
const fieldsRoutes = require('./routes/fields');
const modulesRoutes = require('./routes/modules');
const permissionsRoutes = require('./routes/permissions');
const rolePermissionsRoutes = require('./routes/rolePermissions');
const rolesRoutes = require('./routes/roles');
const routeRoutes = require('./routes/route');
const settingsRoutes = require('./routes/settings');
const fileRoutes = require('./routes/file');
// ----------------------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares Globales ---
app.use(morgan("dev"));
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Archivos estáticos ---
app.use("/storage", express.static("storage"));

// --- Health Check Endpoint ---
app.get('/api/health', async (req, res, next) => {
  try {
    // Ejecuta una consulta simple para verificar la conexión a la DB
    await knex.raw('SELECT 1');
    res.status(200).json({
      message: 'Server is running and Database connection is healthy',
      db_status: 'ok',
      uptime: process.uptime()
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    // Si la DB falla, lanza un error 503 para el health check
    next(new utilsCustomError('Database connection failed', 503));
  }
});

// --- Rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use("/api/blocks", blocksRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/fields", fieldsRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/rolePermissions", rolePermissionsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/file", fileRoutes);


// --- 404 Not Found Handler ---
app.use((req, res, next) => {
  next(new utilsCustomError(`Ruta no encontrada: ${req.originalUrl}`, 404));
});


// --- Middleware Centralizado de Manejo de Errores ---
app.use(errorHandler);


// --- Inicialización del Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});