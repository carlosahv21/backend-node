import userChallengesService from './userChallenges.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class UserChallengesController {
    async getAll(req, res, next) {
        try {
            const result = await userChallengesService.getAllUserChallenges(req.query);
            ApiResponse.success(res, 200, "Desafíos de usuario obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const userChallenge = await userChallengesService.getUserChallengeById(id);
            ApiResponse.success(res, 200, "Desafío de usuario obtenido correctamente", userChallenge);
        } catch (error) {
            next(error);
        }
    }

    async getByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const challenges = await userChallengesService.getUserChallengesByUserId(userId);
            ApiResponse.success(res, 200, "Desafíos del usuario obtenidos correctamente", challenges);
        } catch (error) {
            next(error);
        }
    }

    async join(req, res, next) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;
            const result = await userChallengesService.joinChallenge(userId, challengeId);
            ApiResponse.success(res, 201, "Te has unido al desafío correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async leave(req, res, next) {
        try {
            const { challengeId } = req.params;
            const userId = req.user.id;
            await userChallengesService.leaveChallenge(userId, challengeId);
            ApiResponse.success(res, 200, "Has salido del desafío correctamente");
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await userChallengesService.deleteUserChallenge(req.params.id);
            ApiResponse.success(res, 204, "Desafío de usuario eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }
}

export default new UserChallengesController();