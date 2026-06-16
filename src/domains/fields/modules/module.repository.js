import BaseModel from "../../../shared/models/baseModel.js";

class ModuleRepository extends BaseModel {
    constructor() {
        super('modules');
        this.softDelete = false;
        this.joins = [];
        this.selectFields = ['modules.*'];
        this.searchFields = ['modules.name', 'modules.description'];
    }

    async toggleStatus(id, newStatus) {
        return this.knex(this.tableName).where({ id }).update({ is_active: newStatus });
    }
}

export default new ModuleRepository();