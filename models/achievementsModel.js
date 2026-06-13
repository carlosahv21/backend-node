import BaseModel from './baseModel.js';

class AchievementsModel extends BaseModel {
    constructor() {
        super('achievements');
        this.searchFields = ['achievements.name', 'achievements.description'];
        this.filterMapping = {
            category: 'achievements.category',
        };
    }
}

export default new AchievementsModel();
