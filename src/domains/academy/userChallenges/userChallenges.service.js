import userChallengesRepository from './userChallenges.repository.js';
import AppError from "../../../shared/utils/AppError.js";

class UserChallengesService {
    async getAllUserChallenges(queryParams) {
        return userChallengesRepository.findAll(queryParams);
    }

    async getUserChallengeById(id) {
        return userChallengesRepository.findById(id);
    }

    async getUserChallengesByUserId(userId) {
        return userChallengesRepository.findAll({ user_id: userId });
    }

    async joinChallenge(userId, challengeId) {
        return userChallengesRepository.create({
            user_id: userId,
            challenge_id: challengeId,
            status: 'active',
            progress: 0,
        });
    }

    async leaveChallenge(userId, challengeId) {
        const record = await userChallengesRepository.knex('user_challenges')
            .where({ user_id: userId, challenge_id: challengeId })
            .whereNull('deleted_at')
            .first();

        if (!record) {
            throw new AppError("No estás participando en este desafío", 404);
        }

        return userChallengesRepository.bin(record.id, userId);
    }

    async deleteUserChallenge(id) {
        return userChallengesRepository.delete(id);
    }
}

export default new UserChallengesService();