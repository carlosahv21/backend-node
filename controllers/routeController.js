// controllers/routeController.js
import routeService from '../services/routeService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Rutas de Navegación. 
 * Implementa la obtención de rutas activas para la interfaz de usuario.
 */
class RouteController {
    
    /**
     * Obtiene todas las rutas de navegación activas, generalmente utilizadas para construir el menú.
     */
    async getRoutes(req, res, next) {
        try {
            const routes = await routeService.getActiveRoutesWithModuleInfo();
            ApiResponse.success(res, 200, "Rutas obtenidas correctamente", routes);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new RouteController();