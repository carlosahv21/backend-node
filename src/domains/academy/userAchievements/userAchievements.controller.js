import userAchievementsService from './userAchievements.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class UserAchievementsController {
    async getAll(req, res, next) {
        try {
            const result = await userAchievementsService.getAllUserAchievements(req.query);
            ApiResponse.success(res, 200, "Logros de usuario obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userAchievement = await userAchievementsService.getUserAchievementById(id);
            ApiResponse.success(res, 200, "Logro de usuario obtenido correctamente", userAchievement);
        } catch (error) {
            next(error);
        }
    }

    async getByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const achievements = await userAchievementsService.getUserAchievementsByUserId(userId);
            ApiResponse.success(res, 200, "Logros del usuario obtenidos correctamente", achievements);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newUserAchievement = await userAchievementsService.createUserAchievement(req.body);
            ApiResponse.success(res, 201, "Logro de usuario creado correctamente", newUserAchievement);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await userAchievementsService.deleteUserAchievement(req.params.id);
            ApiResponse.success(res, 204, "Logro de usuario eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }
}

export default new UserAchievementsController();