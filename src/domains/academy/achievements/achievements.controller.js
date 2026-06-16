import achievementsService from './achievements.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class AchievementsController {
    async getAll(req, res, next) {
        try {
            const result = await achievementsService.getAllAchievements(req.query);
            ApiResponse.success(res, 200, "Logros obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const achievement = await achievementsService.getAchievementById(id);
            ApiResponse.success(res, 200, "Logro obtenido correctamente", achievement);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newAchievement = await achievementsService.createAchievement(req.body);
            ApiResponse.success(res, 201, "Logro creado correctamente", newAchievement);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const updatedAchievement = await achievementsService.updateAchievement(req.params.id, req.body);
            ApiResponse.success(res, 200, "Logro actualizado correctamente", updatedAchievement);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await achievementsService.binAchievement(req.params.id);
            ApiResponse.success(res, 200, "Logro movido a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await achievementsService.restoreAchievement(req.params.id);
            ApiResponse.success(res, 200, "Logro restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await achievementsService.deleteAchievement(req.params.id);
            ApiResponse.success(res, 204, "Logro eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new AchievementsController();