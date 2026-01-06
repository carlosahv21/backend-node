// services/routeService.js
import RouteModel from '../models/routeModel.js';
import AppError from '../utils/AppError.js';

/**
 * Obtiene todas las rutas de navegación que pertenecen a módulos activos, 
 * junto con la información del módulo, ordenadas por el campo 'order'.
 */
const getActiveRoutesWithModuleInfo = async () => {
    try {
        const routes = await RouteModel.getActiveRoutesWithModuleInfo();
        return routes;
    } catch (error) {
        throw new AppError("Error al recuperar rutas activas para navegación", 500);
    }
};

export default {
    getActiveRoutesWithModuleInfo,
};