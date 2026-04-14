// controllers/authController.js (Clase puramente delegada)
import authService from "../services/authService.js";
import ApiResponse from "../utils/apiResponse.js";

/**
 * Clase controladora para la autenticación.
 */
class AuthController {

    /**
     * Maneja la solicitud de login.
     */
    async login(req, res, next) {
        try {
            // Delega la autenticación, obtención de datos y generación de token al servicio
            const result = await authService.authenticateUser(req.body);
            ApiResponse.success(res, 200, "Login successful", result);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    /**
     * Maneja la solicitud de datos del usuario autenticado (/me).
     */
    async me(req, res, next) {
        try {
            const userId = req.user.id; // Viene del middleware de token
            // Delega la obtención de todos los datos del perfil al servicio
            const data = await authService.getAuthenticatedUser(userId);
            ApiResponse.success(res, 200, "Perfil de usuario obtenido correctamente", data);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    /**
     * Maneja la solicitud de 'Olvidé mi contraseña' (envío de email con token).
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) throw new AppError("Email is required", 400);

            const result = await authService.forgotPassword(email);
            ApiResponse.success(res, 200, result.message);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    /**
     * Maneja el cambio de contraseña usando un token de recuperación.
     */
    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            if (!token) throw new AppError("Token is required", 400);
            if (!password) throw new AppError("New password is required", 400);

            const result = await authService.resetPasswordWithToken(token, password);
            ApiResponse.success(res, 200, result.message, result);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }

    /**
     * Verifica si un token de recuperación es válido.
     */
    async verifyToken(req, res, next) {
        try {
            const { token } = req.params;
            if (!token) throw new AppError("Token is required", 400);

            const result = await authService.verifyResetToken(token);
            ApiResponse.success(res, 200, result.message, result);
        } catch (err) {
            const status = err.statusCode || 400;
            ApiResponse.error(res, status, err.message);
        }
    }
}

export default new AuthController();