// models/moduleModel.js
import BaseModel from './baseModel.js';

class ModuleModel extends BaseModel {
    constructor() {
        super('modules');
        this.softDelete = false;

        this.joins = [];
        this.selectFields = ['modules.*'];
        this.searchFields = ['modules.name', 'modules.description'];
    }

    /**
    * Activa o desactiva un módulo.
    */
    async toggleStatus(id, newStatus) {
        return this.knex(this.tableName)
            .where({ id })
            .update({ is_active: newStatus });
    }
}

export default new ModuleModel();