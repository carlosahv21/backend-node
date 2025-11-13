// controllers/usersController.js
const BaseController = require('./BaseController');
const bcrypt = require('bcryptjs');

class UsersController extends BaseController {
    joins = [
        { table: "user_roles", alias: "ur", on: ["users.id", "ur.user_id"] },
        { table: "roles", alias: "r", on: ["ur.role_id", "r.id"] }
    ];

    selectFields = ["users.*", "r.name as role_name"];
    searchFields = ["users.first_name", "users.last_name", "users.email", "r.name"];

    constructor() {
        super("users");
    }

    // Sobrescribimos getAll para filtrar por rol si se pasa en query
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search, role } = req.query;

            // Construimos la query base desde el BaseController
            let query = this._buildQuery({ search });

            // Filtrar por rol si se proporciona
            if (role) {
                query = query.where('r.name', role);
            }

            const results = await query.limit(limit).offset((page - 1) * limit);

            // Total de registros considerando el filtro
            let totalQuery = this._buildQuery({ search, isCount: true });
            if (role) totalQuery = totalQuery.where('r.name', role);
            const totalRes = await totalQuery.count("* as count").first();

            res.json({
                data: results,
                total: totalRes.count,
                page: parseInt(page),
                limit: parseInt(limit)
            });
        } catch (error) {
            console.error("❌ Error retrieving users:", error);
            res.status(500).json({ message: "Error retrieving users", error });
        }
    }

    // Sobrescribimos create y update como lo tenías para manejar rol y contraseña
    async create(req, res) {
        try {
            const data = req.body;

            // Encriptar contraseña si existe
            if (data.password) {
                const salt = await bcrypt.genSalt(10);
                data.password = await bcrypt.hash(data.password, salt);
            }

            // Asegurar email_verified por defecto
            if (data.email_verified === undefined) data.email_verified = false;

            const { standardFields } = this.splitFields(data);
            const { role, ...userFields } = standardFields;

            const [userId] = await this.knex(this.tableName).insert(userFields);
            await this.saveCustomFields(userId, data);

            if (role) {
                const roleRecord = await this.knex('roles').where({ name: role }).first();
                if (roleRecord) {
                    await this.knex('user_roles').insert({
                        user_id: userId,
                        role_id: roleRecord.id
                    });
                }
            }

            res.status(201).json({ message: "Usuario creado correctamente" });
        } catch (error) {
            console.error(`❌ Error creating user:`, error);
            res.status(500).json({ message: 'Error interno', error: error.message });
        }
    }

    async update(req, res) {
        try {
            const data = { ...req.body, id: req.params.id };

            const { standardFields } = this.splitFields(data);
            const { role, ...userFields } = standardFields;

            const updatedCount = await this.knex(this.tableName)
                .where({ id: data.id })
                .update(userFields);

            if (updatedCount === 0) return res.status(404).json({ message: "Usuario no encontrado" });

            await this.saveCustomFields(data.id, data);

            if (role) {
                const roleRecord = await this.knex('roles').where({ name: role }).first();
                if (roleRecord) {
                    await this.knex('user_roles').where({ user_id: data.id }).del();
                    await this.knex('user_roles').insert({
                        user_id: data.id,
                        role_id: roleRecord.id
                    });
                }
            }

            res.json({ message: "Usuario actualizado correctamente" });
        } catch (error) {
            console.error(`❌ Error updating user:`, error);
            res.status(500).json({ message: "Error interno", error });
        }
    }
}

module.exports = new UsersController();
