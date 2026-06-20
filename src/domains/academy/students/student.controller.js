import studentService from './student.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class StudentController {
    async getAll(req, res, next) {
        try {
            const result = await studentService.getAllStudents(req.query);
            ApiResponse.success(res, 200, "Estudiantes obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const student = await studentService.getStudentById(id);
            ApiResponse.success(res, 200, "Estudiante obtenido correctamente", student);
        } catch (error) {
            next(error);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const student = await studentService.getStudentByIdDetails(id);
            ApiResponse.success(res, 200, "Detalles del estudiante obtenidos correctamente", student);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newStudent = await studentService.createStudent(req.body);
            ApiResponse.success(res, 201, "Estudiante creado correctamente", newStudent);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedStudent = await studentService.updateStudent(req.params.id, req.body);
            ApiResponse.success(res, 200, "Estudiante actualizado correctamente", updatedStudent);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await studentService.deleteStudent(req.params.id);
            ApiResponse.success(res, 204, "Estudiante eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await studentService.binStudent(req.params.id);
            ApiResponse.success(res, 200, "Estudiante movido a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await studentService.restoreStudent(req.params.id);
            ApiResponse.success(res, 200, "Estudiante restaurado correctamente", result);
        } catch (error) {
            next(error);
        }
    }
}

export default new StudentController();