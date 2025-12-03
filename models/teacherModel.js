// models/teacherModel.js
import { UserModel } from './userModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Teacher.
 * Extiende de UserModel para heredar funcionalidad de usuarios.
 */
class TeacherModel extends UserModel {
    constructor() {
        super();
    }

    async findAll(queryParams = {}) {
        return super.findAllByRole({ ...queryParams, role: 'teacher' });
    }

    async findByIdDetails(id) {
        const apiData = await this._getTeacherData(id);
        return this._transformToViewModel(apiData);
    }

    async _getTeacherData(id) {
        const record = await super.findById(id);

        const roleValues = await this.knex('roles as r')
            .join('users', 'r.id', 'users.role_id')
            .where('users.id', id)
            .select('r.name as role_name')
            .first();

        const classValues = await this.knex('classes as c')
            .join('users', 'c.teacher_id', 'users.id')
            .where('users.id', id)
            .select('c.name as class_name', 'c.date as class_date', 'c.hour as class_hour');

        return {
            ...record,
            ...roleValues,
            assigned_classes: classValues
        };
    }

    _transformToViewModel(apiData) {
        const capitalize = (string) => string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';

        const formatValue = (key, value) => {
            if (value === null || value === undefined) return "-";

            if (key.includes("price") && !isNaN(parseFloat(value))) {
                return `$${parseFloat(value).toFixed(2)}`;
            }
            if (key.includes("verified")) {
                return value === 1 ? "Sí" : "No";
            }
            if (key.includes("date") || key.includes("login") || key.includes("at")) {
                return value;
            }
            return value;
        };

        const assignedClasses = apiData.assigned_classes || [];
        const classItems = assignedClasses.map((c, index) => ({ 
            name: `Clase ${index + 1}`, 
            value: c.class_name + " - " + c.class_date + " - " + c.class_hour, 
        }));

        return {
            title: `${apiData.first_name} ${apiData.last_name}`,
            subtitle: capitalize(apiData.role_name),
            email: apiData.email,
            sections: [
                {
                    label: "Información Básica",
                    items: [
                        { name: "Email Verificado", value: formatValue('email_verified', apiData.email_verified) },
                        { name: "Último Login", value: apiData.last_login },
                        { name: "Creado En", value: apiData.created_at },
                        { name: "Actualizado En", value: apiData.updated_at },
                    ],
                },
                {
                    label: "Clases Asignadas",
                    items: classItems.length > 0 ? classItems : [{ name: "Clases", value: "Ninguna" }]
                },
                {
                    label: "Registro de Tiempos",
                    items: [
                        { name: "Creado En", value: apiData.created_at },
                        { name: "Actualizado En", value: apiData.updated_at },
                    ],
                },
            ],
        };
    }
}

export default new TeacherModel();