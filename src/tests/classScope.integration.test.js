// Tests de integración: filtro de scope RBAC en 'classes' (BaseModel + applyScope).
// Verifica que un teacher solo ve sus clases asignadas, un student solo aquellas
// en las que está inscrito, y admin (scope all) las ve todas — dentro del tenant.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import classRepository from '../domains/academy/classes/class.repository.js';
import {
    knex,
    createTestAcademy,
    insertClass,
    insertUser,
    enroll,
    roleId,
    asUser,
    cleanTestData,
} from './helpers/db.js';

let academy;
let teacher1, teacher2, student;
let classT1, classT2, classOther;

beforeAll(async () => {
    await cleanTestData();
    academy = await createTestAcademy('ScopeAcademy');

    const teacherRole = await roleId('teacher');
    const studentRole = await roleId('student');

    teacher1 = await insertUser(academy, teacherRole, 'teacher1');
    teacher2 = await insertUser(academy, teacherRole, 'teacher2');
    student = await insertUser(academy, studentRole, 'student1');

    classT1 = await insertClass(academy, 'Clase de teacher1', { teacherId: teacher1 });
    classT2 = await insertClass(academy, 'Clase de teacher2', { teacherId: teacher2 });
    classOther = await insertClass(academy, 'Clase sin inscripción', { teacherId: teacher2 });

    // El student está inscrito solo en la clase de teacher1.
    await enroll(academy, student, classT1);
});

afterAll(async () => {
    await cleanTestData();
    await knex.destroy();
});

const teacherView = (userId) => ({
    academyId: academy,
    user: { id: userId, role: 'teacher', academy_id: academy },
    permission: { resource: 'classes', action: 'view', scope: 'assigned' },
});

const studentView = (userId) => ({
    academyId: academy,
    user: { id: userId, role: 'student', academy_id: academy },
    permission: { resource: 'classes', action: 'view', scope: 'own' },
});

const adminView = () => ({
    academyId: academy,
    user: { id: randomAdminId, role: 'admin', academy_id: academy },
    permission: { resource: 'classes', action: 'view', scope: 'all' },
});
const randomAdminId = '00000000-0000-0000-0000-000000000001';

describe('Scope RBAC en classes (integración)', () => {
    it('teacher (assigned) solo ve las clases que imparte en findAll', async () => {
        const result = await asUser(teacherView(teacher1), () =>
            classRepository.findAll({ limit: 100 })
        );
        const ids = result.data.map((c) => c.id);
        expect(ids).toContain(classT1);
        expect(ids).not.toContain(classT2);
        expect(ids).not.toContain(classOther);
    });

    it('teacher (assigned) no puede leer por ID una clase de otro teacher', async () => {
        await expect(
            asUser(teacherView(teacher1), () => classRepository.findById(classT2))
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('teacher (assigned) sí puede leer por ID su propia clase', async () => {
        const record = await asUser(teacherView(teacher1), () =>
            classRepository.findById(classT1)
        );
        expect(record.id).toBe(classT1);
    });

    it('student (own) solo ve las clases en las que está inscrito', async () => {
        const result = await asUser(studentView(student), () =>
            classRepository.findAll({ limit: 100 })
        );
        const ids = result.data.map((c) => c.id);
        expect(ids).toEqual([classT1]);
    });

    it('student (own) no puede leer por ID una clase en la que no está inscrito', async () => {
        await expect(
            asUser(studentView(student), () => classRepository.findById(classOther))
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('admin (scope all) ve todas las clases del tenant', async () => {
        const result = await asUser(adminView(), () =>
            classRepository.findAll({ limit: 100 })
        );
        const ids = result.data.map((c) => c.id);
        expect(ids).toContain(classT1);
        expect(ids).toContain(classT2);
        expect(ids).toContain(classOther);
    });
});
