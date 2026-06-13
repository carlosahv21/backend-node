import userAchievementsModel from '../models/userAchievementsModel.js';

class UserAchievementsService {
    async getAllUserAchievements(queryParams) {
        return userAchievementsModel.findAll(queryParams);
    }

    async getUserAchievementById(id) {
        return userAchievementsModel.findById(id);
    }

    async getByUser(userId) {
        const db = userAchievementsModel.knex;
        return await db('user_achievements as ua')
            .leftJoin('achievements as a', 'ua.achievement_id', 'a.id')
            .where('ua.user_id', userId)
            .whereNull('ua.deleted_at')
            .select(
                'ua.*',
                'a.name as achievement_name',
                'a.description as achievement_description',
                'a.icon_url as achievement_icon',
                'a.category as achievement_category',
            )
            .orderBy('ua.earned_at', 'desc');
    }

    async assignAchievement(data) {
        return userAchievementsModel.create(data);
    }

    async removeAchievement(id, userId) {
        return userAchievementsModel.bin(id, userId);
    }
}

export default new UserAchievementsService();
