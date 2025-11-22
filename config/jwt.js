// config/jwt.js
const utilsCustomError = require('../utils/utilsCustomError');

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key'; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (JWT_SECRET === 'your_default_jwt_secret_key') {
    console.warn("⚠️ ADVERTENCIA: Usando la clave JWT secreta por defecto. ¡Cámbiala inmediatamente en tu archivo .env o variable de entorno!");
}

module.exports = {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
};