// controllers/searchController.js
import searchService from '../services/searchService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Búsqueda (Search). 
 */
class searchController {

    /**
     * Búsqueda general.
     */
    async searchAll(req, res, next) {
        try {
            const result = await searchService.searchAll(req);
            ApiResponse.success(res, 200, "Búsqueda realizada correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new searchController();