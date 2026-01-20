// services/classService.js
import classModel from '../models/classModel.js';
import AppError from '../utils/AppError.js';

class classService {
    /**
     * Obtiene todas las clases (con paginación, búsqueda, filtros).
     */
    async getAllClasses(queryParams) {
        return classModel.findAll(queryParams);
    }

    /**
     * Crea una nueva clase. 
     */
    async createClass(data) {
        if (!data.name || !data.date) {
            throw new AppError('Faltan campos obligatorios para crear la clase (name, date)', 400);
        }

        const newClass = await classModel.create(data);

        return newClass;
    }

    /**
     * Obtiene una clase por ID.
     */
    async getClassById(id) {
        return classModel.findById(id);
    }

    /**
     * Obtiene una clase por ID con detalles.
     */
    async getClassByIdDetails(id) {
        return classModel.findByIdDetails(id);
    }

    /**
     * Actualiza una clase existente.
     */
    async updateClass(id, data) {
        const updatedClass = await classModel.update(id, data);

        return updatedClass;
    }

    /**
     * Envia una clase a la papelera por ID.
     */
    async binClass(id, userId) {
        return classModel.bin(id, userId);
    }

    /**
     * Restaura una clase enviada a la papelera por ID.
     */
    async restoreClass(id) {
        return classModel.restore(id);
    }

    /**
     * Elimina permanentemente una clase por ID.
     */
    async deleteClass(id) {
        return classModel.delete(id);
    }

}

export default new classService();
