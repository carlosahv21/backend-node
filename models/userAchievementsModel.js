import BaseModel from './baseModel.js';

class UserAchievementsModel extends BaseModel {
    constructor() {
        super('user_achievements');
        this.selectFields = [
            'user_achievements.*',
            'a.name as achievement_name',
            'a.description as achievement_description',
            'a.icon_url as achievement_icon',
            'a.category as achievement_category',
            'u.first_name',
            'u.last_name',
        ];
        this.searchFields = [
            'a.name',
            'a.description',
            'u.first_name',
            'u.last_name',
        ];
        this.joins = [
            { table: 'achievements', alias: 'a', on: ['user_achievements.achievement_id', 'a.id'] },
            { table: 'users', alias: 'u', on: ['user_achievements.user_id', 'u.id'] },
        ];
        this.filterMapping = {
            user_id: 'user_achievements.user_id',
            achievement_id: 'user_achievements.achievement_id',
        };
    }
}

export default new UserAchievementsModel();
