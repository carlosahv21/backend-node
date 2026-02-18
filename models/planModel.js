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
    _transformToViewModel(data) {
        const toISO = (d) => d ? new Date(d).toISOString() : null;

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            // Convertir precio a número float
            price: parseFloat(data.price || 0),
            type: (data.type || '').toLowerCase(),
            active: Boolean(data.active),
            trial_period_days: parseInt(data.trial_period_days || 0),

            // max_sessions ya viene transformado por findById (número o "Ilimitadas")
            max_sessions: data.max_sessions,
            max_classes: data.max_classes || null,

            metadata: data.metadata || null,
            created_at: toISO(data.created_at),
            updated_at: toISO(data.updated_at)
        };
    }
}

export default new PlanModel();