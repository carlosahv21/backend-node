import planService from './plan.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class PlanController {
    async getAll(req, res, next) {
        try {
            const result = await planService.getAllPlans(req.query);
            ApiResponse.success(res, 200, "Planes obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const plan = await planService.getPlanById(id);
            ApiResponse.success(res, 200, "Plan obtenido correctamente", plan);
        } catch (error) {
            next(error);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const planDetails = await planService.getPlanByIdDetails(id);
            ApiResponse.success(res, 200, "Detalles del plan obtenidos correctamente", planDetails);
        } catch (error) {
            next(error);
        }
    }

    async getStudentPlan(req, res, next) {
        try {
            const { studentId } = req.params;
            const plan = await planService.getStudentPlan(studentId);
            ApiResponse.success(res, 200, "Plan del estudiante obtenido correctamente", plan);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newPlan = await planService.createPlan(req.body);
            ApiResponse.success(res, 201, "Plan creado correctamente", newPlan);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedPlan = await planService.updatePlan(req.params.id, req.body);
            ApiResponse.success(res, 200, "Plan actualizado correctamente", updatedPlan);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await planService.deletePlan(req.params.id);
            ApiResponse.success(res, 204, "Plan eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }
}

export default new PlanController();