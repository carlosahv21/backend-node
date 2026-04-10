// utils/tenantContext.js
/**
 * Contexto de Tenant por Petición (AsyncLocalStorage)
 *
 * Permite que cualquier capa de la aplicación (modelos, servicios) obtenga
 * el academy_id del usuario autenticado sin necesidad de pasarlo como parámetro.
 *
 * El middleware de autenticación es el único que llama a `runWithTenant`,
 * creando un contexto aislado por petición HTTP.
 */
import { AsyncLocalStorage } from 'async_hooks';

const tenantStorage = new AsyncLocalStorage();

/**
 * Envuelve el handler de la petición en un contexto de tenant.
 * @param {string} academyId - UUID de la academia del usuario autenticado
 * @param {Function} callback - Siguiente función a ejecutar (req, res, next)
 */
export const runWithTenant = (academyId, callback) => {
    return tenantStorage.run({ academy_id: academyId }, callback);
};

/**
 * Obtiene el academy_id del contexto de la petición actual.
 * Retorna null si se llama fuera de un contexto de petición HTTP
 * (ej: scripts de seed, cron jobs) — en ese caso el BaseModel no filtrará.
 * @returns {string|null}
 */
export const getCurrentTenantId = () => {
    const store = tenantStorage.getStore();
    return store?.academy_id ?? null;
};

export default tenantStorage;
