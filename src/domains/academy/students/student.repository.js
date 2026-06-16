import BaseModel from "../../../shared/models/baseModel.js";
import bcrypt from 'bcryptjs';

function generateTempPassword() {
    const words = ['Bienvenido', 'Usuario', 'Acceso', 'Portal', 'Academia'];
    const word = words[Math.floor(Math.random() * words.length)];
    const year = new Date().getFullYear();
    const symbol = ['!', '@', '#', '$'][Math.floor(Math.random() * 4)];
    return `${word}${year}${symbol}`;
}

class StudentRepository extends BaseModel {
    constructor() {
        super('users');

        this.joins = [
            { table: "roles", alias: "r", on: ["users.role_id", "r.id"] },
            { table: "user_plan", alias: "up", on: ["users.id", "up.user_id"] },
            { table: "plans", alias: "p", on: ["up.plan_id", "p.id"] }
        ];

        this.selectFields = ["users.*", "r.name as role_name", "p.name as plan_name"];
        this.searchFields = ["users.first_name", "users.last_name", "users.email", "r.name"];

        this.filterMapping = {
            'role': 'r.name',
            'role_name': 'r.name',
            'plan_name': 'p.name',
            'plan_status': 'up.status'
        };
    }

    async findRoleByName(roleName) {
        return this.knex('roles').where({ name: roleName }).first();
    }

    async create(data) {
        const { role, ...user } = data;

        let tempPassword = null;

        if (role) {
            const roleRecord = await this.findRoleByName(role);
            if (roleRecord) {
                user.role_id = roleRecord.id;
            }
        }

        if (!user.password) {
            tempPassword = generateTempPassword();
            user.password = await bcrypt.hash(tempPassword, 10);
        }

        const result = await super.create(user);
        if (tempPassword) {
            result.temp_password = tempPassword;
        }
        return result;
    }

    async update(id, data) {
        const { role, ...user } = data;

        if (role) {
            const roleRecord = await this.findRoleByName(role);
            if (roleRecord) {
                user.role_id = roleRecord.id;
            }
        }

        return super.update(id, user);
    }

    async findByIdDetails(id) {
        const db = this.knex;

        const student = await this._applyTenantFilter(db('users as u'), 'u')
            .leftJoin('roles as r', 'u.role_id', 'r.id')
            .leftJoin('user_plan as up', (join) => {
                join.on('u.id', '=', 'up.user_id')
                    .andOn('up.id', '=', this._applyTenantFilter(db('user_plan').select('id'), 'user_plan')
                        .whereRaw('user_id = u.id')
                        .orderBy('created_at', 'desc')
                        .limit(1)
                    );
            })
            .leftJoin('plans as p', 'up.plan_id', 'p.id')
            .where('u.id', id)
            .select(
                'u.id', 'u.first_name', 'u.last_name', 'u.email', 'u.email_verified',
                'u.last_login', 'u.created_at', 'r.name as role_name',
                'p.id as plan_id', 'p.name as plan_name', 'p.description as plan_description',
                'p.price as plan_price', 'up.status as plan_status', 'up.classes_used',
                'up.classes_remaining', 'up.start_date as plan_start_date', 'up.end_date as plan_end_date'
            )
            .first();

        if (!student) return null;

        return this._transformToLeanModel(student);
    }

    _transformToLeanModel(data) {
        const toISO = (d) => d ? new Date(d).toISOString() : null;
        const toYMD = (d) => d ? new Date(d).toISOString().split('T')[0] : null;

        return {
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            role: (data.role_name || 'student').toLowerCase(),
            email_verified: Boolean(data.email_verified),
            last_login: toISO(data.last_login),
            created_at: toISO(data.created_at),
            plan: data.plan_id ? {
                id: data.plan_id,
                name: data.plan_name,
                description: data.plan_description,
                price: parseFloat(data.plan_price || 0),
                status: data.plan_status?.toLowerCase() || 'inactive',
                classes_used: data.classes_used || 0,
                classes_total: (data.classes_used || 0) + (data.classes_remaining || 0),
                start_date: toYMD(data.plan_start_date),
                end_date: toYMD(data.plan_end_date)
            } : null
        };
    }
}

export default new StudentRepository();