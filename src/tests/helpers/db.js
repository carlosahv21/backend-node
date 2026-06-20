// Helpers para tests de integración contra Postgres real.
// Usan la misma instancia de Knex configurada por la app (lee el .env).
import knex from '../../config/knex.js';
import { randomUUID } from 'crypto';
import { runWithTenant, setRequestPermission } from '../../shared/utils/tenantContext.js';

/**
 * Crea una academia de prueba y devuelve su id.
 * Las academias de test usan un prefijo reconocible para poder limpiarlas
 * sin tocar datos reales (ej: la academia "Dance Flow" del seed).
 */
export const TEST_ACADEMY_PREFIX = '__test__';

export async function createTestAcademy(name) {
    const id = randomUUID();
    await knex('academies').insert({
        id,
        name: `${TEST_ACADEMY_PREFIX}${name}`,
        created_at: new Date(),
        updated_at: new Date(),
    });
    return id;
}

/**
 * Inserta una clase directamente (sin pasar por BaseModel/tenant context),
 * útil para sembrar datos de un tenant concreto en el setup del test.
 * @param {object} [opts] - { teacherId }
 */
export async function insertClass(academyId, name, opts = {}) {
    const [row] = await knex('classes')
        .insert({
            id: randomUUID(),
            name,
            academy_id: academyId,
            teacher_id: opts.teacherId ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returning('id');
    return typeof row === 'object' ? row.id : row;
}

/**
 * Inserta un usuario de prueba con el rol indicado. El email lleva el prefijo
 * de test para poder limpiarlo sin tocar usuarios reales.
 */
export async function insertUser(academyId, roleId, label) {
    const id = randomUUID();
    await knex('users').insert({
        id,
        first_name: 'Test',
        last_name: label,
        email: `${TEST_ACADEMY_PREFIX}${label}-${id}@test.local`,
        password: 'x',
        role_id: roleId,
        academy_id: academyId,
        created_at: new Date(),
        updated_at: new Date(),
    });
    return id;
}

/** Inscribe un usuario en una clase (relación user_class). */
export async function enroll(academyId, userId, classId) {
    await knex('user_class').insert({
        id: randomUUID(),
        user_id: userId,
        class_id: classId,
        academy_id: academyId,
        created_at: new Date(),
        updated_at: new Date(),
    });
}

/** Devuelve el id de un rol por nombre. */
export async function roleId(name) {
    const r = await knex('roles').where({ name }).first('id');
    return r.id;
}

/**
 * Ejecuta `fn` dentro del contexto de petición de un usuario con un permiso/scope
 * dado, replicando lo que hacen authenticateToken + authorize.
 * @param {object} ctx - { academyId, user, permission }
 */
export function asUser({ academyId, user, permission }, fn) {
    return runWithTenant(academyId, () => {
        if (permission) setRequestPermission(permission);
        return fn();
    }, user);
}

/**
 * Limpia todos los datos de prueba (academias con prefijo + clases, usuarios e
 * inscripciones asociadas). No toca datos reales.
 */
export async function cleanTestData() {
    const testAcademies = await knex('academies')
        .where('name', 'like', `${TEST_ACADEMY_PREFIX}%`)
        .select('id');
    const ids = testAcademies.map((a) => a.id);
    if (ids.length === 0) return;

    await knex('user_class').whereIn('academy_id', ids).del();
    await knex('classes').whereIn('academy_id', ids).del();
    await knex('users').whereIn('academy_id', ids).del();
    await knex('academies').whereIn('id', ids).del();
}

export { knex };
