// models/classModel.js
import BaseModel from './baseModel.js';

class ClassModel extends BaseModel {
    constructor() {
        super('classes'); 

        this.joins = [];
        this.selectFields = ['classes.*'];
        this.searchFields = ['classes.name', 'classes.level', 'classes.genre', 'classes.date'];

        this.validations = [
            { name: "timeConflict", config: {} },
        ];
    }
}

export default new ClassModel();