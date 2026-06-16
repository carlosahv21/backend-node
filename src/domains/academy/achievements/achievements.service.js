import achievementsRepository from './achievements.repository.js';

class AchievementsService {
    async getAllAchievements(queryParams) {
        return achievementsRepository.findAll(queryParams);
    }

    async getAchievementById(id) {
        return achievementsRepository.findById(id);
    }

    async createAchievement(data) {
        return achievementsRepository.create(data);
    }

    async updateAchievement(id, data) {
        return achievementsRepository.update(id, data);
    }

    async binAchievement(id) {
        return achievementsRepository.bin(id);
    }

    async restoreAchievement(id) {
        return achievementsRepository.restore(id);
    }

    async deleteAchievement(id) {
        return achievementsRepository.delete(id);
    }
}

export default new AchievementsService();