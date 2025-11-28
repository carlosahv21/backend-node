// index.js
import 'dotenv/config'; // Forma estándar de cargar .env en ES Modules

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// --- Importación de Archivos Locales (Añadida la extensión .js) ---
import errorHandler from './middlewares/errorHandlerMiddleware.js';
import knex from './config/knex.js';
import utilsCustomError from './utils/utilsCustomError.js';

// --- Importación de Rutas (Añadida la extensión .js) ---
import authRoutes from './routes/authRoute.js';
import usersRoutes from './routes/userRoute.js';
import blocksRoutes from './routes/blockRoute.js';
import classesRoutes from './routes/classRoute.js';
import fieldsRoutes from './routes/fieldRoute.js';
import modulesRoutes from './routes/moduleRoute.js';
import permissionsRoutes from './routes/permissionRoute.js';
import rolePermissionsRoutes from './routes/rolePermissionRoute.js';
import rolesRoutes from './routes/roleRoute.js';
import routeRoutes from './routes/routeRoute.js';
import settingsRoutes from './routes/settingRoute.js';
import fileRoutes from './routes/fileRoute.js';
import planRoutes from './routes/planRoute.js';
import studentsRoutes from './routes/studentRoute.js';
import teachersRoutes from './routes/teacherRoute.js';
import registrationRoutes from './routes/registrationRoute.js';
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
app.use("/api/students", studentsRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/registrations", registrationRoutes);

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