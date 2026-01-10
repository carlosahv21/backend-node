// services/registrationService.js
import RegistrationModel from '../models/registrationModel.js';
import AppError from '../utils/AppError.js';
import knex from '../config/knex.js';

class RegistrationService {
    async create(data) {
        const { user_id, class_id } = data;

        const havePlan = await RegistrationModel.havePlan(user_id);
        if (!havePlan) {
            throw new AppError('El usuario no tiene un plan registrado.', 400);
        }

        // Validar si ya existe la inscripción
        const isRegistered = await RegistrationModel.isRegistered(user_id, class_id);
        if (isRegistered) {
            throw new AppError('El usuario ya está inscrito en esta clase.', 400);
        }

        const isRegisteredInMaxClasses = await RegistrationModel.isRegisteredInMaxClasses(user_id);

        if (isRegisteredInMaxClasses) {
            throw new AppError('El usuario ha alcanzado el número máximo de clases permitidas.', 400);
        }

        const maxUsersPerPlan = await RegistrationModel.maxUserPerClass(class_id);
        if (maxUsersPerPlan) {
            throw new AppError('La clase ha alcanzado el número máximo de estudiantes permitidos.', 400);
        }

        // Crear inscripción
        const newRegistration = await RegistrationModel.create(data);
        return newRegistration;
    }

    async list(queryParams) {
        return await RegistrationModel.findAll(queryParams);
    }

    async delete(id) {
        const registration = await RegistrationModel.findById(id);
        if (!registration) {
            throw new AppError('Inscripción no encontrada.', 404);
        }
        return RegistrationModel.delete(id);
    }

    async bin(id) {
        return RegistrationModel.bin(id);
    }

    async restore(id) {
        return RegistrationModel.restore(id);
    }

    async getAvailableClasses(userId, filters = {}) {
        // Obtener clases en las que el usuario NO está inscrito
        // Esto requiere una query personalizada o usar el modelo de clases

        const subquery = knex('user_class')
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
