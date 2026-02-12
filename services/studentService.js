// services/studentService.js
import studentModel from "../models/studentModel.js";
import notificationService from "./notificationService.js";

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

        try {
            const firstName = newStudent.first_name || 'Usuario';
            const lastName = newStudent.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();

            // If student, send welcome notification
            if (newStudent.role === 'STUDENT') {
                await notificationService.notifyUser(newUser.id, {
                    title: '¡Bienvenido a DanceFlow!',
                    message: `¡Hola ${firstName}! Tu cuenta ha sido creada con éxito. Comienza tu viaje de baile hoy.`,
                    category: 'SYSTEM'
                });
            }

            // Notify admin and receptionist about new registration
            await notificationService.notifyRole('ADMIN', {
                title: 'Nuevo Estudiante',
                message: `${fullName} se ha unido a la academia.`,
                category: 'REGISTRATION',
                related_entity_id: newStudent.id,
                deep_link: `/students/${newStudent.id}/history`
            });

            await notificationService.notifyRole('RECEPTIONIST', {
                title: 'Nuevo Estudiante',
                message: `${fullName} se ha unido a la academia.`,
                category: 'REGISTRATION',
                related_entity_id: newStudent.id,
                deep_link: `/students/${newStudent.id}/history`
            });
        } catch (notifError) {
            console.error('⚠️ Error sending user creation notifications:', notifError.message);
        }

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
