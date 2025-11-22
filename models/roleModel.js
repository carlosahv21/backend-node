// models/roleModel.js
import BaseModel from './baseModel.js';

class RoleModel extends BaseModel {
    constructor() {
        super('roles'); 

        this.joins = [];
        this.selectFields = ['roles.*'];
        this.searchFields = ['roles.name']; 
    }
}

export default new RoleModel();