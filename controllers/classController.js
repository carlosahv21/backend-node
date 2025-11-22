// controllers/classController.js
import classService from '../services/classService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Clase controladora para Clases.
 */
class ClassController {
    
    /**
     * Obtiene todas las clases.
     */
    async getAll(req, res, next) {
        try {
            const result = await classService.getAllClasses(req.query);
            res.status(200).json(result); 
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Obtiene una clase por ID.
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const classRecord = await classService.getClassById(id); 
            res.status(200).json(classRecord);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }


    /**
     * Crea una nueva clase.
     */
    async create(req, res, next) {
        try {
            const newClass = await classService.createClass(req.body);

            res.status(201).json({ 
                message: "Clase creada correctamente", 
                class: newClass 
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
    
    /**
     * Actualiza una clase.
     */
    async update(req, res, next) {
        try {
            await classService.updateClass(req.params.id, req.body);
            
            res.status(200).json({ 
                message: "Clase actualizada correctamente"
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Elimina una clase.
     */
    async delete(req, res, next) {
        try {
            await classService.deleteClass(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

export default new ClassController();