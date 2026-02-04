// services/searchService.js
import searchModel from '../models/searchModel.js';

class searchService {
    /**
     * Búsqueda general
     */
    async searchAll(req) {
        const { q, page, limit } = req.query;
        if (!q) return {
            estudiantes: { data: [], total: 0 },
            profesores: { data: [], total: 0 },
            clases: { data: [], total: 0 }
        };

        return await searchModel.searchAll(
            q,
            parseInt(page) || 1,
            parseInt(limit) || 5
        );
    }
}

export default new searchService();