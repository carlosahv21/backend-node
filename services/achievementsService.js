import achievementsModel from '../models/achievementsModel.js';

class AchievementsService {
    async getAllAchievements(queryParams) {
        return achievementsModel.findAll(queryParams);
    }

    async getAchievementById(id) {
        return achievementsModel.findById(id);
    }

    async createAchievement(data) {
        return achievementsModel.create(data);
    }

    async updateAchievement(id, data) {
        return achievementsModel.update(id, data);
    }

    async binAchievement(id, userId) {
        return achievementsModel.bin(id, userId);
    }

    async restoreAchievement(id) {
        return achievementsModel.restore(id);
    }

    async deleteAchievement(id) {
        return achievementsModel.delete(id);
    }
}

export default new AchievementsService();
