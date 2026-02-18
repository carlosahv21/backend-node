// models/roleModel.js
import BaseModel from './baseModel.js';

class RoleModel extends BaseModel {
    constructor() {
        super('roles'); 

        this.joins = [];
        this.selectFields = ['roles.*'];
        this.searchFields = ['roles.name']; 
    }

    async findByIdDetails(id) {
        const role = await this.findById(id);
        return this._transformToViewModel(role);
    }

    _transformToViewModel(data) {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            permissions: data.permissions,
            created_at: data.created_at,
            updated_at: data.updated_at
        };
    }
}

export default new RoleModel();