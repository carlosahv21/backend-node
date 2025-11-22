// controllers/routeController.js
const routeService = require('../services/routeService');
const utilsCustomError = require('../utils/utilsCustomError');

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
            res.status(200).json(routes);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status || 500));
        }
    }
}

module.exports = new RouteController();