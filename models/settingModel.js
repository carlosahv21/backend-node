// models/settingModel.js
const BaseModel = require('./BaseModel');

class SettingModel extends BaseModel {
    constructor() {
        super('settings');
        this.searchFields = [];
    }

    /**
     * Obtiene la primera y única fila de la tabla de configuraciones.
     */
    async findFirst() {
        const knexInstance = this.getKnexInstance();
        return knexInstance.first();
    }
    
    /**
     * Actualiza la primera y única fila de la tabla de configuraciones.
     */
    async updateFirst(data) {
        const knexInstance = this.getKnexInstance();
        return knexInstance.update(data);
    }
}

module.exports = new SettingModel();