import BaseModel from "../../../shared/models/baseModel.js";

class AchievementsRepository extends BaseModel {
    constructor() {
        super('achievements');
        this.searchFields = ['achievements.name', 'achievements.description'];
        this.filterMapping = { category: 'achievements.category' };
    }
}

export default new AchievementsRepository();