// models/blockModel.js
import BaseModel from './baseModel.js';

class BlockModel extends BaseModel {
    constructor() {
        super('blocks'); // Usa la tabla 'blocks'
        
        this.joins = [];
        this.selectFields = ['blocks.*'];
        this.searchFields = ['blocks.name', 'blocks.description'];
    }

    /**
     * Obtiene el último bloque de un módulo específico por su campo 'order'.
     */
    async findLastBlockInModule(moduleId) {
        return this.knex(this.tableName)
            .where({ module_id: moduleId })
            .orderBy('order', 'desc')
            .first();
    }
}

export default new BlockModel();