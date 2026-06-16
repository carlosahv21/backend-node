import routeRepository from './route.repository.js';
import AppError from "../../../shared/utils/AppError.js";

class RouteService {
    async getActiveRoutesWithModuleInfo() {
        try {
            const routes = await routeRepository.getActiveRoutesWithModuleInfo();
            return routes;
        } catch (error) {
            throw new AppError("Error al recuperar rutas activas para navegación", 500);
        }
    }
}

export default new RouteService();