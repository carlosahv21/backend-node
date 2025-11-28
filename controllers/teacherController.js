// controllers/teacherController.js
import teacherService from '../services/teacherService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Clase controladora para Teacher.
 * Maneja la entrada/salida de la petición HTTP y delega la lógica al Servicio.
 * Usa 'next(error)' para pasar errores al middleware centralizado.
 */
class TeacherController {

    async getAll(req, res, next) {
        try {
            const result = await teacherService.getAllTeachers(req.query);
            res.status(200).json(result);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const teacher = await teacherService.getTeacherById(id);

            if (!teacher) {
                return res.status(404).json({ message: "Profesor no encontrado." });
            }

            res.status(200).json(teacher);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async create(req, res, next) {
        try {
            const newTeacher = await teacherService.createTeacher(req.body);
            res.status(201).json({
                message: "Teacher creado correctamente",
                data: newTeacher
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const teacher = await teacherService.updateTeacher(id, req.body);

            if (!teacher) {
                return res.status(404).json({ message: "Profesor no encontrado para actualizar." });
            }

            res.status(200).json({
                message: "Teacher actualizado correctamente",
                data: teacher
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedTeacher = await teacherService.deleteTeacher(id);

            if (!deletedTeacher) {
                return res.status(404).json({ message: "Profesor no encontrado para eliminar." });
            }

            res.status(200).json({
                message: "Teacher eliminado correctamente",
                data: deletedTeacher
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

export default new TeacherController();