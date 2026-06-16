import AppError from './AppError.js';

/**
 * Aplica scope dinámico a una query de Knex basado en permisos
 * @param {Object} query - Instancia de Knex Query Builder
 * @param {Object} permission - Objeto de permiso inyectado (req.permission)
 * @param {Object} user - Usuario autenticado (req.user)
 * @param {Object} config - Configuración específica del módulo
 */
export async function applyScope(query, permission, user, config) {
    if (!permission || !permission.scope) {
        throw new AppError('Error interno: Permiso o scope no definido', 500);
    }

    const { scope } = permission;

    // Scope 'all': Sin restricciones
    if (scope === 'all') {
        return;
    }

    // Scope 'own': Restringe a registros propios
    if (scope === 'own') {
        if (!config.ownColumn) {
            throw new AppError('Error interno: Configuración ownColumn faltante', 500);
        }
        query.where(config.ownColumn, user.id);
        return;
    }

    // Scope 'assigned': Restringe a registros asignados
    if (scope === 'assigned') {
        if (!config.assignedColumn || !config.assignedResolver) {
            throw new AppError('Error interno: Configuración assignedColumn/assignedResolver faltante', 500);
        }

        try {
            const ids = await config.assignedResolver(user);
            query.whereIn(config.assignedColumn, ids);
        } catch (error) {
            throw new AppError(`Error al resolver asignaciones: ${error.message}`, 500);
        }
        return;
    }
}
