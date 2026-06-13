import userAchievementsService from '../services/userAchievementsService.js';
import ApiResponse from '../utils/apiResponse.js';

class UserAchievementsController {
    async getAll(req, res) {
        try {
            const result = await userAchievementsService.getAllUserAchievements(req.query);
            ApiResponse.success(res, 200, 'Logros de usuario obtenidos correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const userAchievement = await userAchievementsService.getUserAchievementById(id);
            ApiResponse.success(res, 200, 'Logro de usuario obtenido correctamente', userAchievement);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByUser(req, res) {
        try {
            const { userId } = req.params;
            const achievements = await userAchievementsService.getByUser(userId);
            ApiResponse.success(res, 200, 'Logros obtenidos correctamente', achievements);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res) {
        try {
            const newUserAchievement = await userAchievementsService.assignAchievement(req.body);
            ApiResponse.success(res, 201, 'Logro asignado correctamente', { userAchievement: newUserAchievement });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await userAchievementsService.removeAchievement(id, userId);
            ApiResponse.success(res, 200, 'Logro removido correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new UserAchievementsController();
