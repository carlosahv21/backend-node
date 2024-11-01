const knex = require('../db/knex');

const getRoutes = async (req, res, next) => {
    try {
        // Consulta para obtener todas las rutas y sus módulos relacionados
        const routes = await knex('routes')
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
            .leftJoin('modules', 'routes.module_id', 'modules.id') // Relación con módulos
            .where('modules.is_active', true)
            .orderBy('routes.order');

        res.json(routes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        next(error); // Pasa el error al middleware de manejo de errores
    }
};

module.exports = { getRoutes };
