import planRepository from './plan.repository.js';
import AppError from "../../../shared/utils/AppError.js";

class PlanService {
    async getAllPlans(queryParams) {
        return planRepository.findAll(queryParams);
    }

    async getPlanById(id) {
        return planRepository.findById(id);
    }

    async getPlanByIdDetails(id) {
        return planRepository.findByIdDetails(id);
    }

    async getStudentPlan(studentId) {
        return planRepository.getStudentPlan(studentId);
    }

    async createPlan(data) {
        return planRepository.create(data);
    }

    async updatePlan(id, data) {
        if (!id || id === 'undefined' || id === 'null') {
            throw new AppError("ID de plan no válido", 400);
        }
        return planRepository.update(id, data);
    }

    async deletePlan(id) {
        return planRepository.delete(id);
    }
}

export default new PlanService();