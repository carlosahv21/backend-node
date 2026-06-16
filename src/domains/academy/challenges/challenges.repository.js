import BaseModel from "../../../shared/models/baseModel.js";

class ChallengesRepository extends BaseModel {
    constructor() {
        super('challenges');
        this.searchFields = ['challenges.name', 'challenges.description'];
        this.filterMapping = { challenge_type: 'challenges.challenge_type', is_active: 'challenges.is_active' };
    }
}

export default new ChallengesRepository();