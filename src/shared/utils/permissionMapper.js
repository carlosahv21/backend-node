// utils/permissionMapper.js

/**
 * Transforma un arreglo plano de permisos desde BD en un mapa jerárquico O(1).
 * Agrupa las acciones de cada recurso conservando el scope POR ACCIÓN.
 *
 * El scope se guarda en BD por fila (rol, acción, módulo), de modo que dentro
 * de un mismo módulo cada acción puede tener su propio scope. Por eso `actions`
 * es un objeto acción → scope y NO existe un scope a nivel de módulo.
 *
 * Entrada:
 * [
 *   { moduleName: 'students', action: 'view',   scope: 'all' },
 *   { moduleName: 'students', action: 'edit',   scope: 'own' },
 *   { moduleName: 'classes',  action: 'view',   scope: 'assigned' }
 * ]
 *
 * Salida:
 * {
 *   students: { actions: { view: 'all', edit: 'own' } },
 *   classes:  { actions: { view: 'assigned' } }
 * }
 */
export function buildPermissionMap(rawPermissions) {
    const map = {};

    for (const p of rawPermissions) {
        if (!map[p.moduleName]) {
            map[p.moduleName] = { actions: {} };
        }

        // El scope corresponde a esta acción concreta dentro del módulo.
        map[p.moduleName].actions[p.action] = p.scope;
    }

    return map;
}
