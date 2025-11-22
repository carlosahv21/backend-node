// models/routeModel.js
import BaseModel from './baseModel.js';

class RouteModel extends BaseModel {
    constructor() {
        super('routes'); 
        
        this.selectFields = ['routes.*'];
        this.searchFields = ['routes.name', 'routes.path'];
    }

    /**
     * Obtiene todas las rutas de navegación que pertenecen a módulos activos, 
     * junto con la información del módulo, ordenadas por el campo 'order'.
     */
    async getActiveRoutesWithModuleInfo() {
        return this.knex('routes')
            .select(
                'routes.id',
                'routes.name',
                'routes.path',
                'routes.type',
                'routes.icon',
                'routes.order',
                'routes.location',
                'routes.on_click_action',
                'modules.name as module_name',
                'modules.tab as module_tab'   
            )
            .leftJoin('modules', 'routes.module_id', 'modules.id') 
            .where('modules.is_active', true)
            .orderBy('routes.order');
    }
}

export default new RouteModel();