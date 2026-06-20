// utils/tenantContext.js
/**
 * Contexto de Petición (AsyncLocalStorage)
 *
 * Permite que cualquier capa de la aplicación (modelos, servicios) obtenga
 * datos de la petición actual (academy_id del tenant, usuario autenticado y
 * el permiso resuelto con su scope) sin necesidad de pasarlos como parámetro.
 *
 * El middleware de autenticación abre el contexto con `runWithTenant`. El
 * middleware de autorización (`authorize`) escribe luego el `permission`
 * resuelto en el mismo store con `setRequestPermission`, ya que el scope
 * solo se conoce después de validar el permiso.
 */
import { AsyncLocalStorage } from 'async_hooks';

const tenantStorage = new AsyncLocalStorage();

/**
 * Envuelve el handler de la petición en un contexto de petición.
 * @param {string} academyId - UUID de la academia del usuario autenticado
 * @param {Function} callback - Siguiente función a ejecutar (req, res, next)
 * @param {object} [user] - Usuario autenticado ({ id, role, academy_id })
 */
export const runWithTenant = (academyId, callback, user = null) => {
    return tenantStorage.run({ academy_id: academyId, user, permission: null }, callback);
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

/**
 * Obtiene el usuario autenticado del contexto actual (o null fuera de petición).
 */
export const getCurrentUser = () => {
    const store = tenantStorage.getStore();
    return store?.user ?? null;
};

/**
 * Escribe el permiso resuelto en el store ya existente.
 * Lo llama `authorize` después de validar el permiso (cuando ya conoce el scope).
 */
export const setRequestPermission = (permission) => {
    const store = tenantStorage.getStore();
    if (store) store.permission = permission;
};

/**
 * Obtiene el permiso resuelto ({ resource, action, scope }) del contexto actual.
 * Retorna null fuera de una petición o si authorize no se ejecutó.
 */
export const getCurrentPermission = () => {
    const store = tenantStorage.getStore();
    return store?.permission ?? null;
};

export default tenantStorage;
