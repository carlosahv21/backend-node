// models/settingModel.js
import BaseModel from './baseModel.js';

class SettingModel extends BaseModel {
    constructor() {
        super('settings');
    }
}

export default new SettingModel();