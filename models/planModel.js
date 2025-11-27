import BaseModel from './baseModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Plan.
 */
class PlanModel extends BaseModel {
    constructor() {
        super('plans');

        this.jsonFields = ['metadata'];
    }

    /**
     * Crea un nuevo plan, construyendo el campo 'metadata' internamente.
     */
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

    /*
     * Obtiene plan por Id
    */
    async findById(id) {
        const plan = await super.findById(id);
        plan.max_sessions = plan.max_sessions === 0 ? "Ilimitadas" : plan.max_sessions;
        return plan;
    }
}

export default new PlanModel();