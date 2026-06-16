import BaseModel from "../../../shared/models/baseModel.js";

class UserChallengesRepository extends BaseModel {
    constructor() {
        super('user_challenges');
        this.selectFields = [
            'user_challenges.*', 'ch.name as challenge_name', 'ch.description as challenge_description',
            'ch.challenge_type', 'ch.goal_value', 'u.first_name', 'u.last_name',
        ];
        this.searchFields = ['ch.name', 'ch.description', 'u.first_name', 'u.last_name'];
        this.joins = [
            { table: 'challenges', alias: 'ch', on: ['user_challenges.challenge_id', 'ch.id'] },
            { table: 'users', alias: 'u', on: ['user_challenges.user_id', 'u.id'] },
        ];
        this.filterMapping = { user_id: 'user_challenges.user_id', challenge_id: 'user_challenges.challenge_id', status: 'user_challenges.status' };
    }
}

export default new UserChallengesRepository();