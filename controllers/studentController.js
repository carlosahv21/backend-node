// controllers/student.controller.js
import studentService from '../services/student.service.js';

/**
 * Capa de Controlador (Controller) para Student.
 * Maneja la entrada/salida de la petición HTTP y delega la lógica al Servicio.
 * Usa 'next(error)' para pasar errores al middleware centralizado.
 */
class StudentController {

    async getAll(req, res, next) {
        try {
            const items = studentService.getAll();
            res.status(200).json({
                message: "Lista de Student obtenida.",
                data: items
            });
        } catch (error) {
            next(error); 
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const item = studentService.getById(id);
            res.status(200).json({
                message: "Student obtenido.",
                data: item
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newItem = studentService.create(req.body);
            res.status(201).json({
                message: "Student creado exitosamente.",
                data: newItem
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const item = studentService.update(id, req.body);
            res.status(200).json({
                message: "Student actualizado exitosamente.",
                data: item
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new StudentController();