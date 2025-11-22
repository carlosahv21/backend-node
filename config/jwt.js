// config/jwt.js
import utilsCustomError from '../utils/utilsCustomError.js'; // Asumiendo que esta dependencia también usa ES Modules

// Clave secreta y tiempo de expiración
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Advertencia de seguridad si se usa la clave por defecto
if (JWT_SECRET === 'your_default_jwt_secret_key') {
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