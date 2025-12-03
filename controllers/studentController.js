import studentService from '../services/studentService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Capa de Controlador (Controller) para Student.
 */
class StudentController {

    async getAll(req, res, next) {
        try {
            const result = await studentService.getAllStudents(req.query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const student = await studentService.getStudentById(id);

            if (!student) {
                return res.status(404).json({ message: "Registro de estudiante no encontrado." });
            }

            res.status(200).json(student);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newStudent = await studentService.createStudent(req.body);
            res.status(201).json({
                message: "Student creado exitosamente.",
                data: newStudent
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedStudent = await studentService.updateStudent(id, req.body);

            if (!updatedStudent) {
                return res.status(404).json({ message: "Registro de estudiante no encontrado para actualizar." });
            }

            res.status(200).json({
                message: "Student actualizado exitosamente.",
                data: updatedStudent
            });
        } catch (error) {
            next(error);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const student = await studentService.getStudentByIdDetails(id);

            if (!student) {
                return res.status(404).json({ message: "Registro de estudiante no encontrado." });
            }

            res.status(200).json(student);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedStudent = await studentService.deleteStudent(id);

            if (!deletedStudent) {
                return res.status(404).json({ message: "Registro de estudiante no encontrado para eliminar." });
            }

            res.status(200).json({
                message: "Student eliminado exitosamente.",
                data: deletedStudent
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new StudentController();