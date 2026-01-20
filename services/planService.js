// services/student.service.js
import planModel from "../models/planModel.js";
import AppError from "../utils/AppError.js";

class PlanService {
    /**
     * Obtiene todos los estudiantes (con paginación, búsqueda, filtros).
     */
    async getAllPlans(queryParams) {
        return planModel.findAll(queryParams);
    }

    /**
     * Obtiene un estudiante por ID.
     */
    async getPlanById(id) {
        return planModel.findById(id);
    }

    /**
     * Obtiene un estudiante por ID con detalles.
     */
    async getPlanByIdDetails(id) {
        return planModel.findByIdDetails(id);
    }

    /**
     * Crea un nuevo estudiante.
     */
    async createPlan(data) {
        const { name } = data;

        if (!name) {
            throw new AppError('El campo "name" es requerido.', 400);
        }

        const newPlan = await planModel.create(data);

        return newPlan;
    };

    /**
     * Actualiza un estudiante existente.
     */
    async updatePlan(id, data) {
        return planModel.update(id, data);
    }

    /**
     * Bin un estudiante por ID.
     */
    async binPlan(id, userId) {
        return planModel.bin(id, userId);
    }

    /**
     * Restaura un plan por ID.
     */
    async restorePlan(id) {
        return planModel.restore(id);
    }

    /**
     * Elimina un estudiante por ID.
     */
    async deletePlan(id) {
        return planModel.delete(id);
    }

    /**
     * Obtiene el plan actual de un estudiante.
     */
    async getStudentPlan(student_id) {
        return planModel.getStudentPlan(student_id);
    }
}
export default new PlanService();
