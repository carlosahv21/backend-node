/**
 * Standardizes API responses.
 */
class ApiResponse {
    /**
     * Sends a success response.
     * @param {Response} res - Express response object.
     * @param {number} status - HTTP status code (default 200).
     * @param {string} message - Success message.
     * @param {object} data - Optional data payload.
     */
    static success(res, status = 200, message = "Success", data = {}) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    }

    /**
     * Sends an error response.
     * @param {Response} res - Express response object.
     * @param {number} status - HTTP status code (default 500).
     * @param {string} message - Error message.
     * @param {string|object} error - Optional technical error details.
     */
    static error(res, status = 500, message = "Internal Server Error", error = null) {
        const response = {
            success: false,
            message,
        };
        
        if (error) {
            response.error = error;
        }

        return res.status(status).json(response);
    }
}

export default ApiResponse;
