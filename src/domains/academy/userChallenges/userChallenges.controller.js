import userChallengesService from './userChallenges.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class UserChallengesController {
    async getAll(req, res, next) {
        try {
            const result = await userChallengesService.getAllUserChallenges(req.query);
            ApiResponse.success(res, 200, "Desafíos de usuario obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userChallenge = await userChallengesService.getUserChallengeById(id);
            ApiResponse.success(res, 200, "Desafío de usuario obtenido correctamente", userChallenge);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const challenges = await userChallengesService.getUserChallengesByUserId(userId);
            ApiResponse.success(res, 200, "Desafíos del usuario obtenidos correctamente", challenges);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async join(req, res, next) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;
            const result = await userChallengesService.joinChallenge(userId, challengeId);
            ApiResponse.success(res, 201, "Te has unido al desafío correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async leave(req, res, next) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;
            await userChallengesService.leaveChallenge(userId, challengeId);
            ApiResponse.success(res, 200, "Has salido del desafío correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await userChallengesService.deleteUserChallenge(req.params.id);
            ApiResponse.success(res, 204, "Desafío de usuario eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new UserChallengesController();