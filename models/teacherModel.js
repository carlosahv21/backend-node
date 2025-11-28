// models/teacherModel.js
import { UserModel } from './userModel.js';

/**
 * Capa de Acceso a Datos (DAL) para la entidad Teacher.
 * Extiende de UserModel para heredar funcionalidad de usuarios.
 */
class TeacherModel extends UserModel {
    constructor() {
        super();
        // Override searchFields if needed
    }

    /**
     * Obtiene todos los profesores.
     * Fuerza el filtro por rol 'teacher'.
     */
    async findAll(queryParams = {}) {
        return super.findAllByRole({ ...queryParams, role: 'teacher' });
    }
}

export default new TeacherModel();