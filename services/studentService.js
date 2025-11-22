// services/student.service.js
import studentModel from '../models/studentModel.js';
import { CustomError } from '../utils/custom-error.js';

/**
 * Capa de Lógica de Negocio (Business Logic) para Student.
 * Se encarga de las validaciones y transformaciones de datos.
 */
class StudentService {
    
    getAll() {
        // Aquí iría lógica de filtrado o permisos antes de la llamada al Model
        return studentModel.findAll();
    }

    getById(id) {
        const item = studentModel.findById(id);
        if (!item) {
            throw new CustomError(`Elemento Student con ID ${id} no encontrado.`, 404);
        }
        return item;
    }

    create(data) {
        // Validaciones: por ejemplo, que el nombre sea obligatorio
        if (!data.name) {
            throw new CustomError('El campo "name" es requerido.', 400);
        }

        const newItem = studentModel.create(data);
        return newItem;
    }
}

export default new StudentService();