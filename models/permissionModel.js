// models/permissionModel.js
const BaseModel = require('./BaseModel');

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

module.exports = new PermissionModel();