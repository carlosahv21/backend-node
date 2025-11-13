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

    // Sobrescribimos create para manejar la encriptación y la asignación de rol
    async create(req, res) {
        try {
            const data = req.body;

            // Encriptar contraseña si existe
            if (data.password) {
                const salt = await bcrypt.genSalt(10);
                data.password = await bcrypt.hash(data.password, salt);
            }

            // Asegurar email_verified por defecto
            if (data.email_verified === undefined) {
                data.email_verified = false;
            }

            // Separar campos estándar y personalizados
            const { standardFields, customFields } = this.splitFields(data);

            // Extraer role para no insertarlo en la tabla users
            const { role, ...userFields } = standardFields;

            // Insertar usuario
            const [userId] = await this.knex(this.tableName).insert(userFields);

            // Guardar campos dinámicos
            await this.saveCustomFields(userId, data);

            // Asignar rol al usuario
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

    // Sobrescribimos update para manejar la asignación de rol
    async update(req, res) {
        try {
            const data = { ...req.body, id: req.params.id };

            // Separar campos estándar y personalizados
            const { standardFields, customFields } = this.splitFields(data);

            // Extraer role para no insertarlo en la tabla users
            const { role, ...userFields } = standardFields;

            // Actualizar usuario
            const updatedCount = await this.knex(this.tableName)
                .where({ id: data.id })
                .update(userFields);

            if (updatedCount === 0) {
                return res.status(404).json({ message: `${this.tableName} record not found` });
            }

            // Guardar campos dinámicos
            await this.saveCustomFields(data.id, data);

            // Asignar rol al usuario
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

            res.json({ message: `${this.tableName} record updated successfully` });
        } catch (error) {
            console.error(`❌ Error updating user:`, error);
            res.status(500).json({ message: `Error updating user`, error });
        }
    }
}

module.exports = new UsersController();
