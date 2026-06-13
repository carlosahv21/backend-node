import challengesModel from '../models/challengesModel.js';

class ChallengesService {
    async getAllChallenges(queryParams) {
        return challengesModel.findAll(queryParams);
    }

    async getChallengeById(id) {
        return challengesModel.findById(id);
    }

    async createChallenge(data) {
        return challengesModel.create(data);
    }

    async updateChallenge(id, data) {
        return challengesModel.update(id, data);
    }

    async binChallenge(id, userId) {
        return challengesModel.bin(id, userId);
    }

    async restoreChallenge(id) {
        return challengesModel.restore(id);
    }

    async deleteChallenge(id) {
        return challengesModel.delete(id);
    }
}

export default new ChallengesService();
