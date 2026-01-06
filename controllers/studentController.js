import studentService from '../services/studentService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Capa de Controlador (Controller) para Student.
 */
class StudentController {

    async getAll(req, res, next) {
        try {
            const result = await studentService.getAllStudents(req.query);
            ApiResponse.success(res, 200, "Estudiantes obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const student = await studentService.getStudentById(id);

            if (!student) {
                return ApiResponse.error(res, 404, "Registro de estudiante no encontrado.");
            }

            ApiResponse.success(res, 200, "Estudiante obtenido correctamente", student);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newStudent = await studentService.createStudent(req.body);
            ApiResponse.success(res, 201, "Student creado exitosamente.", newStudent);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedStudent = await studentService.updateStudent(id, req.body);

            if (!updatedStudent) {
                return ApiResponse.error(res, 404, "Registro de estudiante no encontrado para actualizar.");
            }

            ApiResponse.success(res, 200, "Student actualizado exitosamente.", updatedStudent);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const student = await studentService.getStudentByIdDetails(id);

            if (!student) {
                return ApiResponse.error(res, 404, "Registro de estudiante no encontrado.");
            }

            ApiResponse.success(res, 200, "Estudiante obtenido correctamente", student);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedStudent = await studentService.deleteStudent(id);

            if (!deletedStudent) {
                return ApiResponse.error(res, 404, "Registro de estudiante no encontrado para eliminar.");
            }

            ApiResponse.success(res, 200, "Student eliminado exitosamente.", deletedStudent);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new StudentController();