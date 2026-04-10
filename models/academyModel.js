// models/academyModel.js
import BaseModel from './baseModel.js';

class AcademyModel extends BaseModel {
    constructor() {
        super('academies');
    }

    /**
     * Busca la academia por su nombre de identificador único (campo name o academy_name si existiera)
     */
    async findByName(name) {
        return this.knex(this.tableName).where({ name }).first();
    }
}

export default new AcademyModel();
