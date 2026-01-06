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
}

export default new AuthController();