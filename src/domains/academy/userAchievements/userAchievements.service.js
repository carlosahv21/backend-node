import userAchievementsRepository from './userAchievements.repository.js';

class UserAchievementsService {
    async getAllUserAchievements(queryParams) {
        return userAchievementsRepository.findAll(queryParams);
    }

    async getUserAchievementById(id) {
        return userAchievementsRepository.findById(id);
    }

    async getUserAchievementsByUserId(userId) {
        return userAchievementsRepository.findAll({ user_id: userId });
    }

    async createUserAchievement(data) {
        return userAchievementsRepository.create(data);
    }

    async deleteUserAchievement(id) {
        return userAchievementsRepository.delete(id);
    }
}

export default new UserAchievementsService();