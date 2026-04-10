// models/settingModel.js
/**
 * SettingModel ahora apunta a la tabla 'academies'.
 *
 * La tabla 'settings' ha sido retirada. Toda la configuración de una academia
 * (moneda, idioma, plan, etc.) reside en el propio registro de 'academies'.
 *
 * NOTA: 'academies' está en GLOBAL_TABLES del BaseModel (no tiene academy_id),
 * así que el filtro automático de tenant NO aplica aquí. El servicio debe
 * filtrar por 'id' usando getCurrentTenantId() directamente.
 */
import BaseModel from './baseModel.js';

class SettingModel extends BaseModel {
    constructor() {
        super('academies');
    }
}

export default new SettingModel();