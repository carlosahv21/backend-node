import planService from '../services/planService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

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
            res.status(200).json(result);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Obtiene un plan por ID.
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const plan = await planService.getPlanById(id);
            res.status(200).json(plan);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
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
                return res.status(404).json({ message: "Plan no encontrado." });
            }

            res.status(200).json(plan);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Crea un nuevo plan.
     */
    async create(req, res, next) {
        try {
            const newPlan = await planService.createPlan(req.body);

            res.status(201).json({
                message: "Plan creado correctamente",
                plan: newPlan
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Actualiza un plan.
     */
    async update(req, res, next) {
        try {
            await planService.updatePlan(req.params.id, req.body);

            res.status(200).json({
                message: "Plan actualizado correctamente"
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Elimina un plan.
     */
    async delete(req, res, next) {
        try {
            await planService.deletePlan(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

export default new PlanController();