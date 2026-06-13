import userChallengesModel from '../models/userChallengesModel.js';
import AppError from '../utils/AppError.js';

class UserChallengesService {
    async getAllUserChallenges(queryParams) {
        return userChallengesModel.findAll(queryParams);
    }

    async getUserChallengeById(id) {
        return userChallengesModel.findById(id);
    }

    async getByUser(userId) {
        const db = userChallengesModel.knex;
        return await db('user_challenges as uc')
            .leftJoin('challenges as ch', 'uc.challenge_id', 'ch.id')
            .where('uc.user_id', userId)
            .whereNull('uc.deleted_at')
            .select(
                'uc.*',
                'ch.name as challenge_name',
                'ch.description as challenge_description',
                'ch.challenge_type',
                'ch.goal_value',
            )
            .orderBy('uc.joined_at', 'desc');
    }

    async joinChallenge(userId, challengeId) {
        const db = userChallengesModel.knex;

        const challenge = await db('challenges')
            .where('id', challengeId)
            .whereNull('deleted_at')
            .first();

        if (!challenge) {
            throw new AppError('Reto no encontrado', 404);
        }

        if (!challenge.is_active) {
            throw new AppError('Este reto no está activo', 400);
        }

        const existing = await db('user_challenges')
            .where({ user_id: userId, challenge_id: challengeId })
            .whereNull('deleted_at')
            .first();

        if (existing) {
            throw new AppError('Ya estás participando en este reto', 409);
        }

        return userChallengesModel.create({
            user_id: userId,
            challenge_id: challengeId,
            status: 'active',
            progress: 0,
        });
    }

    async leaveChallenge(userId, challengeId) {
        const db = userChallengesModel.knex;

        const record = await db('user_challenges')
            .where({ user_id: userId, challenge_id: challengeId })
            .whereNull('deleted_at')
            .first();

        if (!record) {
            throw new AppError('No estás participando en este reto', 404);
        }

        return userChallengesModel.bin(record.id, userId);
    }

    async removeUserChallenge(id, userId) {
        return userChallengesModel.bin(id, userId);
    }
}

export default new UserChallengesService();
