// controllers/authController.js (Clase puramente delegada)
import authService from "../services/authService.js";
import utilsCustomError from "../utils/utilsCustomError.js";

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
            
            res.json({ 
                message: "Login successful", 
                ...result 
            });
        } catch (err) {
            console.error(err);
            next(new utilsCustomError(err.message, err.status));
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
            
            res.json(data);
        } catch (err) {
            console.error(err);
            next(new utilsCustomError(err.message, err.status));
        }
    }
}

export default new AuthController();