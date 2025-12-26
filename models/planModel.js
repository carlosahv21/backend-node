// models/planModel.js
import BaseModel from './baseModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Plan.
 */
class PlanModel extends BaseModel {
    constructor() {
        super('plans');

        this.jsonFields = ['metadata'];
    }

    // --- Métodos de CRUD (Se mantienen iguales) ---
    async create(data) {
        const { max_sessions } = data;
        data.max_sessions = max_sessions === "Ilimitadas" ? 0 : parseInt(max_sessions);
        return super.create(data);
    }

    async update(id, data) {
        const { max_sessions } = data;
        data.max_sessions = max_sessions === "Ilimitadas" ? 0 : parseInt(max_sessions);
        return super.update(id, data);
    }

    async findById(id) {
        const plan = await super.findById(id);
        // Transformación interna: 0 -> "Ilimitadas"
        plan.max_sessions = plan.max_sessions === 0 ? "Ilimitadas" : plan.max_sessions;
        return plan;
    }

    async getStudentPlan(student_id) {
        const plan = await this.knex('user_plan as up')
            .join('plans as p', 'up.plan_id', 'p.id')
            .select('p.name', 'p.description', 'p.type', 'p.price', 'up.status', 'up.start_date', 'up.end_date', 'up.classes_remaining', 'up.max_classes')
            .where('up.user_id', student_id)
            .first();

        return plan;
    }

    // --- Lógica del View Model para el Drawer ---

    async findByIdDetails(id) {
        // Obtenemos el plan ya con la sesión máxima transformada
        const plan = await this.findById(id);

        return this._transformToViewModel(plan);
    }

    /**
     * Transforma el objeto de datos del plan al formato de View Model para el Drawer.
     */
    _transformToViewModel(apiData) {
        const capitalize = (string) => string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';

        const formatValue = (key, value) => {
            if (value === null || value === undefined) return "-";

            // Si el valor es 0 (para max_sessions), ya fue convertido a "Ilimitadas" en findById
            // Si es otro 0 (ej. trial_period_days), lo manejamos aquí.
            if (value === 0 && !key.includes('sessions') && !key.includes('classes')) return 0;

            // Formato de Precio
            if (key.includes("price") && !isNaN(parseFloat(value))) {
                return `$${parseFloat(value).toFixed(2)}`;
            }
            // Formato Booleano (1/0)
            if (key.includes("active")) {
                // Dejamos el valor crudo (1 o 0) y usamos un renderer para el Tag
                return value;
            }

            // Las fechas se dejan en el formato ISO para que el frontend (dayjs) las formatee
            if (key.includes("date") || key.includes("at")) {
                return value;
            }
            return value;
        };

        // Determinar el "tipo de plan" (título principal)
        let subtitleText = capitalize(apiData.type);
        if (apiData.type === 'package') {
            subtitleText = `Paquete de ${apiData.max_sessions} Clases`;
        } else if (apiData.type === 'subscription') {
            subtitleText = 'Suscripción Mensual';
        }


        return {
            title: apiData.name,
            subtitle: subtitleText,
            email: apiData.description, // Usamos la descripción como subtítulo secundario

            sections: [
                {
                    label: "Información de Precios y Tipo",
                    items: [
                        { name: "Precio", value: formatValue('price', apiData.price) },
                        { name: "Tipo de Plan", value: capitalize(apiData.type) },
                        {
                            name: "Estado",
                            // Usamos un renderer que crearemos en el frontend para pintar el Tag
                            value: apiData.active,
                            renderer: 'activeStatusTag'
                        },
                        { name: "Periodo de Prueba (Días)", value: apiData.trial_period_days },
                    ],
                },
                {
                    label: "Límites de Uso",
                    items: [
                        { name: "Sesiones Máximas", value: apiData.max_sessions }, // Usará "Ilimitadas" o el número
                        { name: "Clases Máximas por Día", value: apiData.max_classes || 'N/A' },
                    ],
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

export default new PlanModel();