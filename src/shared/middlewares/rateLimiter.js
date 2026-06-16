// middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Configuración recomendada para proxy (ej. Nginx o balanceador SaaS)
// Nota: Si vas a usar esto detrás de un proxy real, asegúrate de activar:
// app.set('trust proxy', 1); en index.js

/**
 * Standardized response base for when the limit is exceeded.
 */
const rateLimitResponse = {
    success: false,
    error: "rate_limit_exceeded",
    message: "Too many requests. Please try again later."
};

/**
 * Global API Limiter
 * Limita: 100 requests per minute per IP
 * Uso: Aplicar a "/api" o rutas generales.
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 requests
    standardHeaders: true, // Envía RateLimit-* headers
    legacyHeaders: false, // Deshabilita X-RateLimit-* headers
    message: rateLimitResponse,
    statusCode: 429
});

/**
 * Login Limiter
 * Limita: 5 requests per minute per IP
 * Uso: Aplicar a POST "/api/auth/login"
 */
export const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5, // 5 requests
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse,
    statusCode: 429
});

/**
 * Register Limiter
 * Limita: 3 requests per minute per IP
 * Uso: Aplicar a POST "/api/auth/register"
 */
export const registerLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 3, // 3 requests
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse,
    statusCode: 429
});

/**
 * Password Reset Limiter
 * Limita: 3 requests every 15 minutes per IP
 * Uso: Aplicar a POST "/api/auth/reset-password" o equivalentes.
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // 3 requests
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse,
    statusCode: 429
});

export default {
    apiLimiter,
    loginLimiter,
    registerLimiter,
    passwordResetLimiter
};
