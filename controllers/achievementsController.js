import achievementsService from '../services/achievementsService.js';
import ApiResponse from '../utils/apiResponse.js';

class AchievementsController {
    async getAll(req, res) {
        try {
            const result = await achievementsService.getAllAchievements(req.query);
            ApiResponse.success(res, 200, 'Logros obtenidos correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const achievement = await achievementsService.getAchievementById(id);
            ApiResponse.success(res, 200, 'Logro obtenido correctamente', achievement);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res) {
        try {
            const newAchievement = await achievementsService.createAchievement(req.body);
            ApiResponse.success(res, 201, 'Logro creado correctamente', { achievement: newAchievement });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res) {
        try {
            await achievementsService.updateAchievement(req.params.id, req.body);
            ApiResponse.success(res, 200, 'Logro actualizado correctamente');
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await achievementsService.binAchievement(id, userId);
            ApiResponse.success(res, 200, 'Logro movido a papelera correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res) {
        try {
            const { id } = req.params;
            const result = await achievementsService.restoreAchievement(id);
            ApiResponse.success(res, 200, 'Logro restaurado correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res) {
        try {
            await achievementsService.deleteAchievement(req.params.id);
            ApiResponse.success(res, 204, 'Logro eliminado correctamente');
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new AchievementsController();
