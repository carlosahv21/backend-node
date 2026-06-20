// Helpers para tests de integración contra Postgres real.
// Usan la misma instancia de Knex configurada por la app (lee el .env).
import knex from '../../config/knex.js';
import { randomUUID } from 'crypto';

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
 */
export async function insertClass(academyId, name) {
    const [row] = await knex('classes')
        .insert({
            id: randomUUID(),
            name,
            academy_id: academyId,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .returning('id');
    return typeof row === 'object' ? row.id : row;
}

/**
 * Limpia todos los datos de prueba (academias con el prefijo de test y sus clases).
 * No toca datos reales.
 */
export async function cleanTestData() {
    const testAcademies = await knex('academies')
        .where('name', 'like', `${TEST_ACADEMY_PREFIX}%`)
        .select('id');
    const ids = testAcademies.map((a) => a.id);
    if (ids.length === 0) return;

    await knex('classes').whereIn('academy_id', ids).del();
    await knex('academies').whereIn('id', ids).del();
}

export { knex };
