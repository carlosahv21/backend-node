// models/studentModel.js
import { UserModel } from './userModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Student.
 */
class StudentModel extends UserModel {
    constructor() {
        super();
    }

    /**
     * Obtiene todos los estudiantes.
     * Fuerza el filtro por rol 'student'.
     */
    async findAll(queryParams = {}) {
        // Forzamos el rol 'student'
        return super.findAllByRole({ ...queryParams, role: 'student' });
    }
}

export default new StudentModel();