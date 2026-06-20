import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import knex from './config/knex.js';
import ApiResponse from './shared/utils/apiResponse.js';
import errorHandler from './shared/middlewares/errorHandler.js';
import { apiLimiter } from './shared/middlewares/rateLimiter.js';
import routes from './routes/index.js';
import cronService from './services/cronService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────────────
// CORS_ORIGIN acepta una lista de orígenes separados por coma.
// En producción es obligatorio definirla: usar "*" junto con credentials
// está prohibido por los navegadores y abriría el API a cualquier origen.
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (isProduction && corsOrigins.length === 0) {
  throw new Error(
    'CORS_ORIGIN debe estar definido en producción (lista de orígenes permitidos separados por coma)'
  );
}

// En desarrollo, sin configuración explícita, reflejamos el origen de la
// petición para facilitar pruebas locales sin abrir credentials a "*".
const corsOptions = {
  origin: corsOrigins.length > 0 ? corsOrigins : true,
  credentials: true,
};

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/storage", express.static("storage"));

cronService.initialize();
console.log('📅 Cron jobs initialized for automated notifications');

app.get('/api/health', async (req, res, next) => {
  try {
    await knex.raw('SELECT 1');
    ApiResponse.success(res, 200, "Server is running and Database connection is healthy", {
      db_status: 'ok',
      uptime: process.uptime()
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    ApiResponse.error(res, 500, error.message);
  }
});

app.use('/api', apiLimiter);
app.use('/api', routes);

app.use((req, res, next) => {
  ApiResponse.error(res, 404, `Ruta no encontrada: ${req.originalUrl}`);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});