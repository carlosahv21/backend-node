// models/moduleModel.js
const BaseModel = require('./BaseModel');

class ModuleModel extends BaseModel {
    constructor() {
        super('modules');
        
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

module.exports = new ModuleModel();