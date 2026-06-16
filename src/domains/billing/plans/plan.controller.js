import planService from './plan.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class PlanController {
    async getAll(req, res, next) {
        try {
            const result = await planService.getAllPlans(req.query);
            ApiResponse.success(res, 200, "Planes obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const plan = await planService.getPlanById(id);
            ApiResponse.success(res, 200, "Plan obtenido correctamente", plan);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const planDetails = await planService.getPlanByIdDetails(id);
            ApiResponse.success(res, 200, "Detalles del plan obtenidos correctamente", planDetails);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getStudentPlan(req, res, next) {
        try {
            const { studentId } = req.params;
            const plan = await planService.getStudentPlan(studentId);
            ApiResponse.success(res, 200, "Plan del estudiante obtenido correctamente", plan);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newPlan = await planService.createPlan(req.body);
            ApiResponse.success(res, 201, "Plan creado correctamente", newPlan);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const updatedPlan = await planService.updatePlan(req.params.id, req.body);
            ApiResponse.success(res, 200, "Plan actualizado correctamente", updatedPlan);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await planService.deletePlan(req.params.id);
            ApiResponse.success(res, 204, "Plan eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new PlanController();