// utils/permissionMapper.js

/**
 * Transforma un arreglo plano de permisos desde BD en un mapa jerárquico O(1).
 * Agrupa todas las acciones bajo el mismo recurso.
 *
 * Entrada:
 * [
 *   { moduleName: 'students', action: 'view', scope: 'all' },
 *   { moduleName: 'students', action: 'create', scope: 'all' },
 *   { moduleName: 'payments', action: 'view', scope: 'academy' }
 * ]
 *
 * Salida:
 * {
 *   students: { actions: ['view', 'create'], scope: 'all' },
 *   payments: { actions: ['view'], scope: 'academy' }
 * }
 */
export function buildPermissionMap(rawPermissions) {
    const map = {};

    for (const p of rawPermissions) {
        if (!map[p.moduleName]) {
            map[p.moduleName] = {
                actions: [],
                scope: p.scope // Asumimos que el scope es el mismo para todas las acciones del módulo en este rol
            };
        }
        
        // Evitamos duplicados por si acaso
        if (!map[p.moduleName].actions.includes(p.action)) {
            map[p.moduleName].actions.push(p.action);
        }
    }

    return map;
}
