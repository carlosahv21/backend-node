import BaseModel from "../../../shared/models/baseModel.js";

class PlanRepository extends BaseModel {
    constructor() {
        super('plans');
        this.jsonFields = ['metadata'];
        this.searchFields = ['plans.name', 'plans.description', 'plans.type', 'plans.status'];
    }

    async create(data) {
        if (data.max_sessions !== undefined) {
            data.max_sessions = data.max_sessions === "Ilimitadas" ? 0 : parseInt(data.max_sessions || 0);
        }
        return super.create(data);
    }

    async update(id, data) {
        if (data.max_sessions !== undefined) {
            data.max_sessions = data.max_sessions === "Ilimitadas" ? 0 : parseInt(data.max_sessions || 0);
        }
        return super.update(id, data);
    }

    async findById(id) {
        const plan = await super.findById(id);
        plan.max_sessions = plan.max_sessions === 0 ? "Ilimitadas" : plan.max_sessions;
        return plan;
    }

    async getStudentPlan(student_id) {
        const plan = await this._applyTenantFilter(this.knex('user_plan as up'), 'up')
            .join('plans as p', 'up.plan_id', 'p.id')
            .select('p.name', 'p.description', 'p.type', 'p.price', 'up.status', 'up.start_date', 'up.end_date', 'up.classes_remaining', 'up.max_classes')
            .where('up.user_id', student_id)
            .first();
        return plan;
    }

    async findByIdDetails(id) {
        const plan = await this.findById(id);
        if (!plan) return null;

        const students = await this._getPlanStudents(id);

        return {
            ...this._transformToViewModel(plan),
            students: students.map(s => ({
                id: s.id,
                full_name: `${s.first_name} ${s.last_name}`,
                status: s.status,
                joined_at: s.created_at
            }))
        };
    }

    async _getPlanStudents(planId) {
        const db = this.knex;
        return await this._applyTenantFilter(db('user_plan as up'), 'up')
            .join('users as u', 'up.user_id', 'u.id')
            .where('up.plan_id', planId)
            .select('u.id', 'u.first_name', 'u.last_name', 'up.status', 'up.created_at')
            .orderBy('up.created_at', 'desc');
    }

    _transformToViewModel(data) {
        const toISO = (d) => d ? new Date(d).toISOString() : null;
        return {
            id: data.id, name: data.name, description: data.description,
            price: parseFloat(data.price || 0), type: (data.type || '').toLowerCase(),
            active: Boolean(data.active), trial_period_days: parseInt(data.trial_period_days || 0),
            max_sessions: data.max_sessions, max_classes: data.max_classes || null,
            metadata: data.metadata || null, created_at: toISO(data.created_at), updated_at: toISO(data.updated_at)
        };
    }
}

export default new PlanRepository();