// models/teacherModel.js
import BaseModel from './baseModel';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Student.
 */

class TeacherModel extends BaseModel {
    constructor() {
        super('teacher');

        this.joins = [];
        this.selectFields = ['teacher.*'];
        this.searchFields = ['teacher.nombre'];
    }

    /**
     * Obtiene todos los profesores.
     */
    async findAll() {
        return this.knex(this.tableName).select('*');
    }

    /**
     * Obtiene un profesor por ID.
     */
    async findById(id) {
        const teacher = await this.knex(this.tableName).where({ id }).first();

        if (!teacher) {
            throw new Error('El profesor no existe');
        }

        return teacher;
    }

    /**
     * Crea un nuevo profesor.
     */
    async create(data) {
        const newTeacher = await this.knex(this.tableName).insert(data);

        return newTeacher;
    }
}

export default new TeacherModel();