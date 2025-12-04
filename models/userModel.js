// models/userModel.js
import BaseModel from './baseModel.js';
import bcrypt from 'bcryptjs';

class UserModel extends BaseModel {
    constructor() {
        super('users');

        this.joins = [
            { table: "roles", alias: "r", on: ["users.role_id", "r.id"] }
        ];

        this.selectFields = ["users.*", "r.name as role_name"];
        this.searchFields = ["users.first_name", "users.last_name", "users.email", "r.name"];

        this.filterMapping = { 'role': 'r.name' };

        this.relationMaps = {
            'default': {
                joins: this.joins,
                column_map: this.filterMapping
            }
        };
    }

    // --- Método para obtener todos los usuarios con un filtro opcional por rol ---

    async findAllByRole(queryParams = {}) {
        const { role, ...filters } = queryParams;

        let query = this._buildQuery(filters);

        if (role) {
            query = query.where('r.name', role);
        }

        let totalCountQuery = this._buildQuery({ ...filters, isCount: true });

        if (role) {
            totalCountQuery = totalCountQuery.where('r.name', role);
        }
        const totalRes = await totalCountQuery.count("* as count").first();
        const totalCount = parseInt(totalRes.count || 0);

        const limit = parseInt(filters.limit || 10);
        const page = parseInt(filters.page || 1);

        const results = await query.clone().limit(limit).offset((page - 1) * limit);

        return {
            data: results,
            total: totalCount,
            page: page,
            limit: limit
        };
    }

    async create(userData) {
        const { password, ...user } = userData;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        return super.create(user);
    }

    async update(id, userData) {
        const { password, ...user } = userData;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        return super.update(id, user);
    }

    // --- Métodos de Relación Específicos para Roles (Acceso a datos) ---

    async findRoleByName(roleName) {
        return this.knex('roles').where({ name: roleName }).first();
    }

    async assignRole(userId, roleId) {
        await this.knex('users').where({ id: userId }).update({ role_id: roleId });
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

export { UserModel };
export default new UserModel();