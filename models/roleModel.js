// models/roleModel.js
const BaseModel = require('./BaseModel');

class RoleModel extends BaseModel {
    constructor() {
        super('roles'); 

        this.joins = [];
        this.selectFields = ['roles.*'];
        this.searchFields = ['roles.name']; 
    }
}

module.exports = new RoleModel();