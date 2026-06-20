import routeService from './route.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class RouteController {
    async getRoutes(req, res, next) {
        try {
            const routes = await routeService.getActiveRoutesWithModuleInfo();
            ApiResponse.success(res, 200, "Rutas obtenidas correctamente", routes);
        } catch (error) {
            next(error);
        }
    }
}

export default new RouteController();