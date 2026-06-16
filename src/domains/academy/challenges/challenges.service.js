import challengesRepository from './challenges.repository.js';

class ChallengesService {
    async getAllChallenges(queryParams) {
        return challengesRepository.findAll(queryParams);
    }

    async getChallengeById(id) {
        return challengesRepository.findById(id);
    }

    async createChallenge(data) {
        return challengesRepository.create(data);
    }

    async updateChallenge(id, data) {
        return challengesRepository.update(id, data);
    }

    async binChallenge(id) {
        return challengesRepository.bin(id);
    }

    async restoreChallenge(id) {
        return challengesRepository.restore(id);
    }

    async deleteChallenge(id) {
        return challengesRepository.delete(id);
    }
}

export default new ChallengesService();