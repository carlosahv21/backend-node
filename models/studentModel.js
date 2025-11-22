// models/student.model.js
import BaseModel from './baseModel';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Student.
 */
class StudentModel extends BaseModel {
    constructor() {
        super('students');
        this.searchFields = [];
    }

    findAll() {
        return this.collection;
    }

    findById(id) {
        const itemId = parseInt(id, 10); 
        return this.collection.find(item => item.id === itemId);
    }

    create(data) {
        const newItem = { id: this.nextId++, ...data };
        this.collection.push(newItem);
        return newItem;
    }
}

export default new StudentModel();