// policies/policyEngine.js
import AppError from '../utils/AppError.js';

/**
 * Motor de políticas principal SaaS.
 * 
 * Evalúa genéricamente el acceso a un recurso basándose en el "scope" RBAC 
 * inyectado por el middleware, y las reglas del tenant de la academia.
 * 
 * @param {Object} permission - El permiso resuelto { resource, action, scope }
 * @param {Object} user - El usuario autenticado (con id, role, academy_id)
 * @param {Object} targetObj - El objeto de la bd a acceder/modificar
 * @param {Object} config - Configuración { ownField: 'teacher_id', academyField: 'academy_id' }
 * @returns {Boolean} true si está autorizado, false o throw si no.
 */
export const evaluatePolicy = (permission, user, targetObj, config = {}) => {
    if (!permission || !permission.scope) {
        throw new AppError('Error interno: Permiso no definido en política', 500);
    }

    const { scope } = permission;

    // Scope "all": Acceso total en todo el sistema (ej. Super Admin)
    if (scope === 'all') {
        return true;
    }

    // Scope "academy": Restringido al tenant local del usuario
    if (scope === 'academy') {
        const academyField = config.academyField || 'academy_id';
        if (targetObj[academyField] === undefined) {
            throw new AppError(`Error interno: El objeto no tiene campo de tenant ${academyField}`, 500);
        }
        return targetObj[academyField] === user.academy_id;
    }

    // Scope "own": Restringido únicamente a los registros donde el usuario es dueño
    if (scope === 'own') {
        const ownField = config.ownField || 'user_id';
        if (targetObj[ownField] === undefined) {
            throw new AppError(`Error interno: El objeto no tiene campo owner ${ownField}`, 500);
        }
        return targetObj[ownField] === user.id;
    }

    return false;
};
