import searchService from './search.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class SearchController {
    async searchAll(req, res, next) {
        try {
            const { q, page = 1, limit = 5 } = req.query;
            if (!q) {
                return ApiResponse.error(res, 400, "Search query is required");
            }
            const data = await searchService.searchAll(q, parseInt(page), parseInt(limit));
            ApiResponse.success(res, 200, "Search results retrieved successfully", data);
        } catch (error) {
            next(error);
        }
    }
}

export default new SearchController();