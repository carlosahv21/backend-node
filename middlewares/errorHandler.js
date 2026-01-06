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

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // In production, you might want to hide the full error stack or details
    const errorDetails = process.env.NODE_ENV === 'production' ? null : err.message;

    return ApiResponse.error(res, statusCode, message, errorDetails);
};

export default errorHandler;
