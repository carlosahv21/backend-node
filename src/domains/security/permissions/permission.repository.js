import BaseModel from "../../../shared/models/baseModel.js";

class PermissionRepository extends BaseModel {
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

export default new PermissionRepository();