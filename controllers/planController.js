import planService from "../services/planService.js";
import ApiResponse from "../utils/apiResponse.js";

/**
 * Clase controladora para Planes.
 */
class PlanController {
    /**
     * Obtiene todos los planes.
     */
    async getAll(req, res, next) {
        try {
            const result = await planService.getAllPlans(req.query);
            ApiResponse.success(res, 200, "Planes obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene un plan por ID.
     */
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

    /**
     * Obtiene un plan por ID con detalles.
     */
    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const plan = await planService.getPlanByIdDetails(id);

            if (!plan) {
                return ApiResponse.error(res, 404, "Plan no encontrado.");
            }

            ApiResponse.success(res, 200, "Plan obtenido correctamente", plan);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Crea un nuevo plan.
     */
    async create(req, res, next) {
        try {
            const newPlan = await planService.createPlan(req.body);
            ApiResponse.success(res, 201, "Plan creado correctamente", {
                plan: newPlan,
            });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Actualiza un plan.
     */
    async update(req, res, next) {
        try {
            await planService.updatePlan(req.params.id, req.body);
            ApiResponse.success(res, 200, "Plan actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Elimina un plan.
     */
    async delete(req, res, next) {
        try {
            await planService.deletePlan(req.params.id);
            ApiResponse.success(res, 204, "Plan eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Bin un plan.
     */
    async bin(req, res, next) {
        try {
            const result = await planService.binPlan(req.params.id);
            ApiResponse.success(
                res,
                200,
                "Plan movido a papelera correctamente",
                result
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Restaura un plan.
     */
    async restore(req, res, next) {
        try {
            const result = await planService.restorePlan(req.params.id);
            ApiResponse.success(res, 200, "Plan restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene el plan actual de un estudiante.
     */
    async getStudentPlan(req, res, next) {
        try {
            const { student_id } = req.params;
            const plan = await planService.getStudentPlan(student_id);
            ApiResponse.success(res, 200, "Plan obtenido correctamente", plan);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new PlanController();
