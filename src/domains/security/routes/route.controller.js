import routeService from './route.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class RouteController {
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