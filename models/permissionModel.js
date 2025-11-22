// models/permissionModel.js
import BaseModel from './baseModel.js';

class PermissionModel extends BaseModel {
    constructor() {
        super('permissions');
        
        this.joins = [];
        this.selectFields = ['permissions.*'];
        this.searchFields = ['permissions.name', 'permissions.description']; 

        this.validations = [
            { name: "uniqueField", config: { field: "name" } },
        ];
    }
}

export default new PermissionModel();