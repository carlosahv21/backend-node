// Tests de integración: aislamiento de tenant en BaseModel contra Postgres real.
// Verifican que un tenant nunca puede leer/modificar registros de otro,
// incluso conociendo el UUID exacto del registro ajeno.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { runWithTenant } from '../shared/utils/tenantContext.js';
import classRepository from '../domains/academy/classes/class.repository.js';
import {
    knex,
    createTestAcademy,
    insertClass,
    cleanTestData,
} from './helpers/db.js';

let academyA;
let academyB;
let classA;
let classB;

beforeAll(async () => {
    await cleanTestData();
    academyA = await createTestAcademy('AcademyA');
    academyB = await createTestAcademy('AcademyB');
    classA = await insertClass(academyA, 'Salsa A');
    classB = await insertClass(academyB, 'Bachata B');
});

afterAll(async () => {
    await cleanTestData();
    await knex.destroy();
});

describe('BaseModel tenant isolation (integración)', () => {
    it('findAll solo devuelve registros del tenant activo', async () => {
        const result = await runWithTenant(academyA, async () => {
            return classRepository.findAll({ limit: 100 });
        });
        const ids = result.data.map((c) => c.id);
        expect(ids).toContain(classA);
        expect(ids).not.toContain(classB);
        // Todos los registros pertenecen a la academia A
        expect(result.data.every((c) => c.academy_id === academyA)).toBe(true);
    });

    it('findById de un registro de OTRO tenant lanza 404 aunque se conozca el UUID', async () => {
        await expect(
            runWithTenant(academyA, async () => classRepository.findById(classB))
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('findById del propio tenant sí devuelve el registro', async () => {
        const record = await runWithTenant(academyA, async () =>
            classRepository.findById(classA)
        );
        expect(record.id).toBe(classA);
        expect(record.academy_id).toBe(academyA);
    });

    it('create inyecta automáticamente el academy_id del tenant activo', async () => {
        const created = await runWithTenant(academyB, async () =>
            classRepository.create({ name: 'Kizomba creada en B' })
        );
        expect(created.academy_id).toBe(academyB);

        // Y no es visible desde el tenant A
        await expect(
            runWithTenant(academyA, async () => classRepository.findById(created.id))
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('update no puede modificar un registro de otro tenant', async () => {
        await expect(
            runWithTenant(academyA, async () =>
                classRepository.update(classB, { name: 'hackeado' })
            )
        ).rejects.toMatchObject({ statusCode: 404 });

        // El registro de B permanece intacto
        const intact = await knex('classes').where({ id: classB }).first();
        expect(intact.name).toBe('Bachata B');
    });

    it('bin (soft delete) no puede afectar un registro de otro tenant', async () => {
        await expect(
            runWithTenant(academyA, async () => classRepository.bin(classB))
        ).rejects.toMatchObject({ statusCode: 404 });

        const intact = await knex('classes').where({ id: classB }).first();
        expect(intact.deleted_at).toBeNull();
    });
});
