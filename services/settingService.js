// services/settingService.js
import knex from '../config/knex.js';
import AppError from '../utils/AppError.js';
import { getCurrentTenantId } from '../utils/tenantContext.js';

/**
 * Campos que pertenecen a la academia (tabla 'academies').
 */
const ACADEMY_FIELDS = ['name', 'logo_url', 'plan', 'currency', 'date_format', 'address'];

/**
 * Campos que pertenecen al usuario (tabla 'users') - preferencias personales.
 */
const USER_FIELDS = ['theme', 'language'];

class SettingService {
    /**
     * Obtiene la configuración actual de la academia del tenant autenticado.
     * Incluye las preferencias del usuario autenticado (theme, language).
     */
    async getSettings(userId) {
        const academyId = getCurrentTenantId();

        const academy = await knex('academies').where('id', academyId).first();
        if (!academy) {
            throw new AppError('Configuración de academia no encontrada.', 404);
        }

        // Preferencias personales del usuario
        const user = await knex('users')
            .where('id', userId)
            .select('theme', 'language')
            .first();

        return {
            id: academy.id,
            name: academy.name,
            logo_url: academy.logo_url,
            plan: academy.plan,
            currency: academy.currency,
            date_format: academy.date_format,
            address: academy.address,
            // Preferencias del usuario
            theme: user?.theme || 'light',
            language: user?.language || 'es',
        };
    }

    /**
     * Actualiza la configuración de la academia y/o preferencias del usuario.
     * Enruta automáticamente cada campo a la tabla correcta.
     */
    async updateSettings(userId, data) {
        const academyId = getCurrentTenantId();

        // Separar los campos por destino
        const academyData = {};
        const userData = {};

        for (const [key, value] of Object.entries(data)) {
            if (ACADEMY_FIELDS.includes(key)) {
                academyData[key] = value;
            } else if (USER_FIELDS.includes(key)) {
                userData[key] = value;
            }
            // Campos desconocidos son ignorados de forma segura
        }

        // Actualizar academia si hay campos correspondientes
        if (Object.keys(academyData).length > 0) {
            await knex('academies').where('id', academyId).update(academyData);
        }

        // Actualizar usuario si hay preferencias personales
        if (Object.keys(userData).length > 0) {
            await knex('users').where('id', userId).update(userData);
        }

        // Retornar la configuración actualizada completa
        return this.getSettings(userId);
    }
}

export default new SettingService();