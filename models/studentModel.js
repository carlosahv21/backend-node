// models/studentModel.js
import { UserModel } from './userModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Student.
 */
class StudentModel extends UserModel {
    constructor() {
        super();
    }

    /**
     * Obtiene los detalles completos de un estudiante sin transformar la estructura.
     */
    async _getStudentData(id) {
        const record = await super.findById(id);

        const planValues = await this.knex('plans as p')
            .join('users', 'p.id', 'users.plan_id')
            .where('users.id', id)
            .select('p.name as plan_name', 'p.description as plan_description', 'p.price as plan_price')
            .first();

        const roleValues = await this.knex('roles as r')
            .join('users', 'r.id', 'users.role_id')
            .where('users.id', id)
            .select('r.name as role_name')
            .first();

        return { ...record, ...planValues, ...roleValues };
    }

    /**
     * Transforma el objeto de datos de la API al formato de View Model para el Drawer.
     */
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

        return {
            title: `${apiData.first_name} ${apiData.last_name}`,
            subtitle: capitalize(apiData.role_name),
            email: apiData.email,
            sections: [
                {
                    label: "Información del Plan",
                    items: [
                        { name: "Plan Asignado", value: apiData.plan_name },
                        { name: "Descripción", value: apiData.plan_description },
                        { name: "Precio", value: formatValue('price', apiData.plan_price) },
                        {
                            name: "Estado",
                            value: apiData.plan_status,
                        },
                        { name: "Clases Usadas", value: apiData.plan_classes_used },
                        { name: "Inicio", value: apiData.plan_start_date },
                        { name: "Fin", value: apiData.plan_end_date },
                    ],
                },
                {
                    label: "Registro de Tiempos",
                    items: [
                        { name: "Email Verificado", value: formatValue('email_verified', apiData.email_verified) },
                        { name: "Último Login", value: apiData.last_login },
                        { name: "Creado En", value: apiData.created_at },
                        { name: "Actualizado En", value: apiData.updated_at },
                    ],
                },
            ],
        };
    }

    /**
     * Método principal para obtener el detalle y transformarlo.
     */
    async findByIdDetails(id) {
        const apiData = await this._getStudentData(id);
        return this._transformToViewModel(apiData);
    }
}

export default new StudentModel();