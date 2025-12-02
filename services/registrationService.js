// services/registrationService.js
import RegistrationModel from '../models/registrationModel.js';
import utilsCustomError from '../utils/utilsCustomError.js';
import knex from '../config/knex.js';

class RegistrationService {
    async create(data) {
        const { user_id, class_id } = data;

        // Validar si ya existe la inscripción
        const isRegistered = await RegistrationModel.isRegistered(user_id, class_id);
        if (isRegistered) {
            throw new utilsCustomError('El usuario ya está inscrito en esta clase.', 400);
        }

        const isRegisteredInMaxClasses = await RegistrationModel.isRegisteredInMaxClasses(user_id);

        if (isRegisteredInMaxClasses) {
            throw new utilsCustomError('El usuario ha alcanzado el número máximo de clases permitidas.', 400);
        }

        const maxUsersPerPlan = await RegistrationModel.maxUserPerClass(class_id);
        if (maxUsersPerPlan) {
            throw new utilsCustomError('La clase ha alcanzado el número máximo de estudiantes permitidos.', 400);
        }

        // Crear inscripción
        const newRegistration = await RegistrationModel.create(data);
        return newRegistration;
    }

    async list(user_id, queryParams) {
        return await RegistrationModel.findAllClassesByStudentId(user_id, queryParams);
    }

    async delete(id) {
        const registration = await RegistrationModel.findById(id);
        if (!registration) {
            throw new utilsCustomError('Inscripción no encontrada.', 404);
        }
        return RegistrationModel.delete(id);
    }

    async getAvailableClasses(userId, filters = {}) {
        // Obtener clases en las que el usuario NO está inscrito
        // Esto requiere una query personalizada o usar el modelo de clases

        const subquery = knex('class_user')
            .select('class_id')
            .where('user_id', userId);

        const query = knex('classes')
            .whereNotIn('id', subquery)
            .andWhere('is_active', true); // Asumiendo que classes tiene is_active

        // Aplicar filtros básicos si es necesario (e.g. búsqueda por nombre)
        if (filters.search) {
            query.where('name', 'like', `%${filters.search}%`);
        }

        const limit = parseInt(filters.limit || 10);
        const page = parseInt(filters.page || 1);

        const results = await query.clone().limit(limit).offset((page - 1) * limit);

        const totalRes = await query.clone().count("* as count").first();

        return {
            data: results,
            total: parseInt(totalRes.count),
            page: page,
            limit: limit
        };
    }
}

export default new RegistrationService();
