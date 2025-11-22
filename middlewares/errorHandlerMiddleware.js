// middlewares/errorHandler.js
/**
 * Middleware de manejo de errores centralizado.
 */
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500; 
    
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR ${status}]: ${message}`, err.stack);

    res.status(status).json({
        success: false,
        message: message
    });
};

export default errorHandler;