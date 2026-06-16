import BaseModel from "../../../shared/models/baseModel.js";

class BlockRepository extends BaseModel {
    constructor() {
        super('blocks');
        this.joins = [];
        this.selectFields = ['blocks.*'];
        this.searchFields = ['blocks.name', 'blocks.description'];
    }

    async findLastBlockInModule(moduleId) {
        return this.knex(this.tableName)
            .where({ module_id: moduleId })
            .orderBy('order', 'desc')
            .first();
    }
}

export default new BlockRepository();