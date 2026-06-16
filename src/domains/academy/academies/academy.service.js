import academyRepository from './academy.repository.js';
import AppError from "../../../shared/utils/AppError.js";
import { getCurrentTenantId } from "../../../shared/utils/tenantContext.js";
import knex from "../../../config/knex.js";
import bcrypt from 'bcryptjs';

class AcademyService {
    async getAllAcademies(query) {
        return academyRepository.findAll(query);
    }

    async getMyAcademy() {
        const academyId = getCurrentTenantId();
        if (!academyId) throw new AppError("No se pudo identificar el tenant de la academia", 401);
        return academyRepository.findById(academyId);
    }

    async getAcademyById(id) {
        const academy = await academyRepository.findById(id);
        if (!academy) throw new AppError("Academy not found", 404);
        return academy;
    }

    async registerAcademy(data) {
        const { academy, user } = data;

        if (!academy?.name || !user?.email || !user?.password) {
            throw new AppError("Faltan datos obligatorios para el registro (nombre academia, email y password usuario)", 400);
        }

        return await knex.transaction(async (trx) => {
            const existingAcademy = await trx('academies').where('name', academy.name).first();
            if (existingAcademy) {
                throw new AppError("Ya existe una academia con ese nombre", 409);
            }

            const existingUser = await trx('users').where('email', user.email).first();
            if (existingUser) {
                throw new AppError("El correo electrónico ya está registrado", 409);
            }

            const adminRole = await trx('roles').where('name', 'admin').first();
            if (!adminRole) {
                throw new AppError("Error de sistema: El rol de administrador no está configurado", 500);
            }

            const [academyResult] = await trx('academies').insert({
                name: academy.name,
                logo_url: academy.logo_url || null,
                plan: 'free',
                currency: 'USD',
                date_format: 'YYYY-MM-DD',
                address: academy.address || null,
                created_at: new Date(),
                updated_at: new Date()
            }).returning('id');
            const academyId = typeof academyResult === 'object' ? academyResult.id : academyResult;

            const hashedPassword = await bcrypt.hash(user.password, 10);
            await trx('users').insert({
                first_name: user.first_name || 'Admin',
                last_name: user.last_name || academy.name,
                email: user.email,
                password: hashedPassword,
                role_id: adminRole.id,
                academy_id: academyId,
                email_verified: true,
                tour_completed: false,
                hide_tour: false,
                needs_password_change: true,
                created_at: new Date(),
                updated_at: new Date()
            });

            return {
                id: academyId,
                name: academy.name,
                owner_email: user.email,
                message: "Academia registrada con éxito. Ya puedes iniciar sesión."
            };
        });
    }

    async updateAcademy(id, data) {
        const tenantId = getCurrentTenantId();
        if (tenantId && tenantId !== id) {
            throw new AppError("No tienes permisos para actualizar esta academia", 403);
        }
        return academyRepository.update(id, data);
    }

    async deleteAcademy(id) {
        return academyRepository.delete(id);
    }
}

export default new AcademyService();