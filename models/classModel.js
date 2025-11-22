// models/classModel.js
const BaseModel = require('./baseModel');

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

module.exports = new ClassModel();