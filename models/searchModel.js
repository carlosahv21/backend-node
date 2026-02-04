import knex from '../config/knex.js';

class searchModel {
    constructor() {
        this.knex = knex;
    }
    /**
     * Búsqueda general segmentada con paginación y totales
     * @param {string} queryTerm - Término de búsqueda
     * @param {number} page - Página actual
     * @param {number} limit - Cantidad de registros por página
     */
    async searchAll(queryTerm, page = 1, limit = 5) {
        // Normalizamos el término de búsqueda: tratamos '+' como espacio y limpiamos
        const normalizedQuery = queryTerm.replace(/\+/g, ' ').trim();
        const searchSafe = `%${normalizedQuery}%`;
        const offset = (page - 1) * limit;

        // Función auxiliar para construir la base de la consulta de usuarios
        const buildUserQuery = (roleName) => {
            return this.knex('users as u')
                .join('roles as r', 'u.role_id', 'r.id')
                .where('r.name', roleName)
                .whereNull('u.deleted_at')
                .andWhere(function () {
                    // Buscamos en el nombre concatenado (nombre + apellido), email o campos individuales
                    this.where(knex.raw("CONCAT(u.first_name, ' ', u.last_name)"), 'like', searchSafe)
                        .orWhere('u.email', 'like', searchSafe);
                });
        };

        // Función auxiliar para construir la base de la consulta de clases
        const buildClassQuery = () => {
            return this.knex('classes')
                .whereNull('deleted_at')
                .where(function () {
                    this.where('name', 'like', searchSafe)
                        .orWhere('genre', 'like', searchSafe)
                        .orWhere('description', 'like', searchSafe);
                });
        };

        // Ejecutamos todas las consultas (datos y conteo) en paralelo
        const [
            estudiantesData, estudiantesCount,
            profesoresData, profesoresCount,
            clasesData, clasesCount
        ] = await Promise.all([
            // Estudiantes
            buildUserQuery('student').clone().select('u.id', 'u.first_name', 'u.last_name', 'u.email').limit(limit).offset(offset),
            buildUserQuery('student').clone().count('* as total').first(),

            // Profesores
            buildUserQuery('teacher').clone().select('u.id', 'u.first_name', 'u.last_name', 'u.email').limit(limit).offset(offset),
            buildUserQuery('teacher').clone().count('* as total').first(),

            // Clases
            buildClassQuery().clone().select('id', 'name', 'level', 'genre', 'date', 'hour').limit(limit).offset(offset),
            buildClassQuery().clone().count('* as total').first()
        ]);

        return {
            estudiantes: {
                data: estudiantesData,
                total: parseInt(estudiantesCount.total || 0)
            },
            profesores: {
                data: profesoresData,
                total: parseInt(profesoresCount.total || 0)
            },
            clases: {
                data: clasesData,
                total: parseInt(clasesCount.total || 0)
            }
        };
    }
}

export default new searchModel();