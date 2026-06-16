import BaseModel from "../../../shared/models/baseModel.js";

class RolePermissionRepository extends BaseModel {
    constructor() {
        super('role_permissions');
        this.selectFields = ['role_permissions.*'];
    }

    async getPermissionsByRoleId(role_id) {
        return this.knex('permissions as p')
            .join('role_permissions as rp', 'p.id', 'rp.permission_id')
            .where('rp.role_id', role_id)
            .select('p.id', 'p.name', 'p.description', 'rp.scope');
    }

    async deleteByRoleId(role_id, trx) {
        const query = (trx || this.knex)('role_permissions').where({ role_id }).del();
        return query;
    }

    async insertBatch(inserts, trx) {
        if (inserts.length === 0) return [];
        const query = (trx || this.knex)('role_permissions').insert(inserts);
        return query;
    }
}

export default new RolePermissionRepository();