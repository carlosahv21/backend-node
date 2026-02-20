// models/rolePermissionModel.js
import BaseModel from './baseModel.js';

class RolePermissionModel extends BaseModel {
    constructor() {
        super('role_permissions');
        this.selectFields = ['role_permissions.*'];
    }

    /**
     * Obtiene los permisos detallados (de la tabla 'permissions') asociados a un rol.
     */
    async getPermissionsByRoleId(role_id) {
        return this.knex('permissions as p')
            .join('role_permissions as rp', 'p.id', 'rp.permission_id')
            .where('rp.role_id', role_id)
            .select('p.id', 'p.name', 'p.description', 'rp.scope');
    }

    /**
     * Elimina todas las entradas de permisos para un rol específico.
     */
    async deleteByRoleId(role_id, trx) {
        const query = (trx || this.knex)('role_permissions').where({ role_id }).del();
        return query;
    }

    /**
     * Inserta múltiples asignaciones de permisos a un rol.
     */
    async insertBatch(inserts, trx) {
        if (inserts.length === 0) return [];
        const query = (trx || this.knex)('role_permissions').insert(inserts);
        return query;
    }
}

export default new RolePermissionModel();