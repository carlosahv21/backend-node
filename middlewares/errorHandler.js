import ApiResponse from '../utils/apiResponse.js';

/**
 * Global error handling middleware.
 * Captures any errors passed to next() and sends a standardized response.
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    if (err.stack) {
        console.error(err.stack);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Manejo de errores específicos de PostgreSQL
    if (err.code === '23505') {
        statusCode = 409;
        message = 'El registro ya existe (violación de unicidad).';
    }
    
    // In production, you might want to hide the full error stack or details
    const errorDetails = process.env.NODE_ENV === 'production' ? null : err.message;

    return ApiResponse.error(res, statusCode, message, errorDetails);
};

export default errorHandler;
