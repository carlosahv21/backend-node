import BaseModel from './baseModel.js';

class ChallengesModel extends BaseModel {
    constructor() {
        super('challenges');
        this.searchFields = ['challenges.name', 'challenges.description'];
        this.filterMapping = {
            challenge_type: 'challenges.challenge_type',
            is_active: 'challenges.is_active',
        };
    }
}

export default new ChallengesModel();
