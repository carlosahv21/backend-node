// config/jwt.js
import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_SECRET = 'your_default_jwt_secret_key';

// Clave secreta y tiempo de expiración
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// En producción la clave por defecto es inaceptable: fallar al arrancar.
// En desarrollo solo advertimos para no bloquear el flujo local.
if (JWT_SECRET === DEFAULT_SECRET) {
    if (isProduction) {
        throw new Error(
            "JWT_SECRET no está definido. Configúralo en las variables de entorno antes de arrancar en producción."
        );
    }
    console.warn("⚠️ ADVERTENCIA: Usando la clave JWT secreta por defecto. ¡Cámbiala inmediatamente en tu archivo .env o variable de entorno!");
}

/**
 * Configuración de JSON Web Token (JWT).
 */

const jwtConfig = {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
};

export default jwtConfig;