// services/classService.js
import classModel from '../models/classModel.js';
import AppError from '../utils/AppError.js';
import notificationService from './notificationService.js';

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

        // NOTIFICATIONS: Notify teacher if assigned
        try {
            if (data.teacher_id) {
                const days = data.days || 'programados';
                const time = data.time || 'a confirmar';

                await notificationService.notifyUser(data.teacher_id, {
                    title: '¡Nueva Clase Asignada!',
                    message: `Se te ha asignado ${data.name} los ${days} a las ${time}.`,
                    category: 'CLASS',
                    related_entity_id: newClass.id,
                    deep_link: `/classes/${newClass.id}`
                });
            }
        } catch (notifError) {
            console.error('⚠️ Error sending class assignment notification:', notifError.message);
            // Don't block class creation if notification fails
        }

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
        // Check if teacher changed
        const oldClass = await classModel.findById(id);
        const teacherChanged = data.teacher_id && data.teacher_id !== oldClass.teacher_id;

        const updatedClass = await classModel.update(id, data);

        // NOTIFICATIONS: Notify new teacher if assigned
        try {
            if (teacherChanged) {
                const days = updatedClass.days || 'programados';
                const time = updatedClass.time || 'a confirmar';

                await notificationService.notifyUser(data.teacher_id, {
                    title: '¡Nueva Clase Asignada!',
                    message: `Se te ha asignado ${updatedClass.name} los ${days} a las ${time}.`,
                    category: 'CLASS',
                    related_entity_id: updatedClass.id,
                    deep_link: `/classes/${updatedClass.id}`
                });
            }
        } catch (notifError) {
            console.error('⚠️ Error sending class reassignment notification:', notifError.message);
            // Don't block class update if notification fails
        }

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

    /**
     * Obtiene la próxima clase.
     */
    async getNextClass() {
        return classModel.getNextClass();
    }
}

export default new classService();
