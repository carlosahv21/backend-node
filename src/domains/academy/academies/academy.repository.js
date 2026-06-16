import BaseModel from "../../../shared/models/baseModel.js";

class AcademyRepository extends BaseModel {
    constructor() {
        super('academies');
    }

    async findByName(name) {
        return this.knex(this.tableName).where({ name }).first();
    }
}

export default new AcademyRepository();