import userChallengesService from '../services/userChallengesService.js';
import ApiResponse from '../utils/apiResponse.js';

class UserChallengesController {
    async getAll(req, res) {
        try {
            const result = await userChallengesService.getAllUserChallenges(req.query);
            ApiResponse.success(res, 200, 'Retos de usuario obtenidos correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const userChallenge = await userChallengesService.getUserChallengeById(id);
            ApiResponse.success(res, 200, 'Reto de usuario obtenido correctamente', userChallenge);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByUser(req, res) {
        try {
            const { userId } = req.params;
            const challenges = await userChallengesService.getByUser(userId);
            ApiResponse.success(res, 200, 'Retos obtenidos correctamente', challenges);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async join(req, res) {
        try {
            const userId = req.user.id;
            const { challenge_id } = req.body;
            const result = await userChallengesService.joinChallenge(userId, challenge_id);
            ApiResponse.success(res, 201, 'Te has unido al reto correctamente', { userChallenge: result });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async leave(req, res) {
        try {
            const userId = req.user.id;
            const { challengeId } = req.params;
            const result = await userChallengesService.leaveChallenge(userId, challengeId);
            ApiResponse.success(res, 200, 'Has abandonado el reto correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await userChallengesService.removeUserChallenge(id, userId);
            ApiResponse.success(res, 200, 'Reto de usuario removido correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new UserChallengesController();
