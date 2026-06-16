import BaseModel from "../../../shared/models/baseModel.js";

class SearchRepository extends BaseModel {
    constructor() {
        super('users');
    }

    async searchAll(queryTerm, page = 1, limit = 5) {
        const normalizedQuery = queryTerm.replace(/\+/g, ' ').trim();
        const searchSafe = `%${normalizedQuery}%`;
        const offset = (page - 1) * limit;

        const buildUserQuery = (roleName) => {
            return this._applyTenantFilter(this.knex('users as u'), 'u')
                .join('roles as r', 'u.role_id', 'r.id')
                .where('r.name', roleName)
                .whereNull('u.deleted_at')
                .andWhere(function () {
                    this.where(this.knex.raw("CONCAT(u.first_name, ' ', u.last_name)"), 'like', searchSafe)
                        .orWhere('u.email', 'like', searchSafe);
                });
        };

        const buildClassQuery = () => {
            return this._applyTenantFilter(this.knex('classes'), 'classes')
                .whereNull('deleted_at')
                .where(function () {
                    this.where('name', 'like', searchSafe)
                        .orWhere('genre', 'like', searchSafe)
                        .orWhere('description', 'like', searchSafe);
                });
        };

        const [
            estudiantesData, estudiantesCount,
            profesoresData, profesoresCount,
            clasesData, clasesCount
        ] = await Promise.all([
            buildUserQuery('student').clone().select('u.id', 'u.first_name', 'u.last_name', 'u.email').limit(limit).offset(offset),
            buildUserQuery('student').clone().count('* as total').first(),
            buildUserQuery('teacher').clone().select('u.id', 'u.first_name', 'u.last_name', 'u.email').limit(limit).offset(offset),
            buildUserQuery('teacher').clone().count('* as total').first(),
            buildClassQuery().clone().select('id', 'name', 'level', 'genre', 'date', 'hour').limit(limit).offset(offset),
            buildClassQuery().clone().count('* as total').first()
        ]);

        return {
            estudiantes: { data: estudiantesData, total: parseInt(estudiantesCount.total || 0) },
            profesores: { data: profesoresData, total: parseInt(profesoresCount.total || 0) },
            clases: { data: clasesData, total: parseInt(clasesCount.total || 0) }
        };
    }
}

export default new SearchRepository();