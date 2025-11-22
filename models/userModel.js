// models/userModel.js
import BaseModel from './baseModel.js';

class UserModel extends BaseModel {
    constructor() {
        super('users');

        this.joins = [
            { table: "user_roles", alias: "ur", on: ["users.id", "ur.user_id"] },
            { table: "roles", alias: "r", on: ["ur.role_id", "r.id"] }
        ];

        this.selectFields = ["users.*", "r.name as role_name"];
        this.searchFields = ["users.first_name", "users.last_name", "users.email", "r.name"];
    }

    // --- Método para obtener todos los usuarios con un filtro opcional por rol ---

    async findAllByRole(queryParams = {}) {
        const { role, ...filters } = queryParams;

        // Construir la query base usando la configuración de joins/selects de este modelo
        let query = this._buildQuery(filters);

        // Aplicar el filtro específico por rol
        if (role) {
            query = query.where('r.name', role);
        }

        // Obtener resultados y conteo total, usando la lógica del BaseModel
        const limit = parseInt(filters.limit || 10);
        const page = parseInt(filters.page || 1);

        const results = await query.clone().limit(limit).offset((page - 1) * limit);

        // Conteo total considerando el filtro de rol
        const totalQuery = this._buildQuery({ ...filters, isCount: true });
        let totalCountQuery = totalQuery;
        if (role) {
            totalCountQuery = totalCountQuery.where('r.name', role);
        }

        const totalRes = await totalCountQuery.count("* as count").first();

        return {
            data: results,
            total: parseInt(totalRes.count),
            page: page,
            limit: limit
        };
    }

    // --- Métodos de Relación Específicos para Roles (Acceso a datos) ---

    async findRoleByName(roleName) {
        return this.knex('roles').where({ name: roleName }).first();
    }

    async assignRole(userId, roleId) {
        await this.knex('user_roles').where({ user_id: userId }).del();
        await this.knex('user_roles').insert({
            user_id: userId,
            role_id: roleId
        });
    }

    async updateRole(userId, roleName) {
        const roleRecord = await this.findRoleByName(roleName);
        if (roleRecord) {
            await this.assignRole(userId, roleRecord.id);
        }
    }

    async findByEmail(email) {
        return this.knex(this.tableName).where({ email }).first();
    }
}

export default new UserModel();