// services/studentService.js
import studentModel from "../models/studentModel.js";

class StudentService {
    /**
     * Obtiene todos los estudiantes (con paginación, búsqueda, filtros).
     */
    async getAllStudents(queryParams) {
        return studentModel.findAll(queryParams);
    }

    /**
     * Obtiene un estudiante por ID.
     */
    async getStudentById(id) {
        return studentModel.findById(id);
    }

    async getStudentByIdDetails(id) {
        return studentModel.findByIdDetails(id);
    }

    /**
     * Crea un nuevo estudiante.
     */
    async createStudent(data) {
        const newStudent = await studentModel.create(data);

        return newStudent;
    }

    /**
     * Actualiza un estudiante existente.
     */
    async updateStudent(id, data) {
        return studentModel.update(id, data);
    }

    // Elimina un estudiante por ID.
    async binStudent(id, userId) {
        return studentModel.bin(id, userId);
    }

    // Restaura un estudiante por ID.
    async restoreStudent(id) {
        return studentModel.restore(id);
    }

    async deleteStudent(id) {
        return studentModel.delete(id);
    }
}

export default new StudentService();
