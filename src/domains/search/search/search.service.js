import searchRepository from './search.repository.js';

class SearchService {
    async searchAll(queryTerm, page, limit) {
        return searchRepository.searchAll(queryTerm, page, limit);
    }
}

export default new SearchService();