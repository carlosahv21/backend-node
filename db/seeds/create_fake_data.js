// DataBase/2025..._create_fake_data.js

import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// --- Constantes de Generación ---
const NUM_PROFESSORS = 10;
const NUM_STUDENTS = 100;
const NUM_CLASSES = 50;
const MAX_REGISTRATIONS_PER_STUDENT = 10;
const PROFESSOR_ROLE_ID = 3;
const STUDENT_ROLE_ID = 2;

// Días de la semana para clases (1=Lun, 6=Sáb). Domingo (7) excluido.
const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Funciones Auxiliares para Datos ---

const createRandomUser = (roleId) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const user = {
    first_name: firstName,
    last_name: lastName,
    email: faker.internet.email({ firstName, lastName, provider: 'fakedance.com' }).toLowerCase(),
    // 💡 Uso de bcrypt.hashSync para cifrar la contraseña 'password123'
    password: bcrypt.hashSync('password123', 10),
    role_id: roleId,
    email_verified: faker.datatype.boolean(),
    last_login: faker.date.recent({ days: 60 }),
    created_at: faker.date.past({ years: 1 }),
    updated_at: faker.date.recent({ days: 1 }),
  };

  // Agregar datos de plan solo para estudiantes (role_id = 2)
  if (roleId === STUDENT_ROLE_ID) {
    user.plan_id = faker.number.int({ min: 1, max: 4 }); // Ajustado a 4 planes
    user.plan_start_date = faker.date.recent({ days: 90 });
    user.plan_end_date = faker.date.soon({ days: 60, refDate: user.plan_start_date });
    user.plan_classes_used = faker.number.int({ min: 0, max: 20 });
    user.plan_status = faker.helpers.arrayElement(['active', 'expired', 'paused']);
  }

  return user;
};

const createRandomClass = (teacherIds) => {
  const level = faker.helpers.arrayElement(['Basic', 'Intermediate', 'Advanced']);
  const genre = faker.helpers.arrayElement(['Salsa', 'Bachata']);
  const days = faker.helpers.arrayElement(CLASS_DAYS).toString();
  const randomHour = faker.number.int({ min: 8, max: 22 }).toString().padStart(2, '0');
  const randomMinute = (faker.number.int({ min: 0, max: 11 }) * 5).toString().padStart(2, '0');
  const classHour = `${randomHour}:${randomMinute}`;

  return {
    name: `${genre} (${level})`,
    level: level,
    genre: genre,
    description: faker.lorem.sentence(),
    duration: faker.number.int({ min: 60, max: 90 }), // Minutos
    date: days,
    hour: classHour, // Hora en formato 24h (HH:mm)
    capacity: faker.number.int({ min: 15, max: 30 }),
    // Asignación obligatoria a un profesor
    teacher_id: faker.helpers.arrayElement(teacherIds),
    created_at: faker.date.past({ years: 0.5 }),
    updated_at: faker.date.recent({ days: 1 }),
  };
};

// --- Funciones de Seeder (Knex) ---

/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // 0. Limpieza: Importante para evitar conflictos de Foreign Keys
  await knex('class_user').del();
  await knex('classes').del();
  await knex('users').where('role_id', PROFESSOR_ROLE_ID).del();
  await knex('users').where('role_id', STUDENT_ROLE_ID).del();

  console.log(`\n--- Generando datos de prueba (Faker) ---`);

  // 1. Crear e insertar Profesores (necesario para las clases)
  const professorRecords = faker.helpers.multiple(() => createRandomUser(PROFESSOR_ROLE_ID), { count: NUM_PROFESSORS });
  console.log(`- Insertando ${NUM_PROFESSORS} Profesores.`);
  await knex('users').insert(professorRecords);

  // Obtener los IDs de los profesores recién creados
  const professors = await knex('users').select('id').where('role_id', PROFESSOR_ROLE_ID);
  const professorIds = professors.map(p => p.id);

  // 2. Crear e insertar Estudiantes
  const studentRecords = faker.helpers.multiple(() => createRandomUser(STUDENT_ROLE_ID), { count: NUM_STUDENTS });
  console.log(`- Insertando ${NUM_STUDENTS} Estudiantes.`);
  await knex('users').insert(studentRecords);

  // 3. Crear e insertar Clases (asignadas a los profesores)
  if (professorIds.length === 0) {
    console.error("¡ERROR! No hay profesores para asignar las clases.");
    return;
  }
  const classRecords = faker.helpers.multiple(() => createRandomClass(professorIds), { count: NUM_CLASSES });
  console.log(`- Insertando ${NUM_CLASSES} Clases (asignadas a un profesor).`);
  await knex('classes').insert(classRecords);

  // --- 4. Crear Inscripciones (Tabla class_user) ---
  const students = await knex('users').select('id').where('role_id', STUDENT_ROLE_ID);
  const classes = await knex('classes').select('id');

  const registrations = [];
  students.forEach(student => {
    const numRegistrations = faker.number.int({ min: 1, max: MAX_REGISTRATIONS_PER_STUDENT });
    const randomClasses = faker.helpers.shuffle(classes).slice(0, numRegistrations);

    randomClasses.forEach(classItem => {
      registrations.push({
        user_id: student.id,
        class_id: classItem.id,
        created_at: faker.date.recent({ days: 60 }),
        updated_at: faker.date.recent({ days: 1 }),
      });
    });
  });

  console.log(`- Generando ${registrations.length} inscripciones.`);
  // Insertar todas las inscripciones masivamente
  await knex.batchInsert('class_user', registrations, 500);

  console.log(`\n✅ Proceso de siembra (seeding) completado exitosamente.`);
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  // Reverse the seed actions
  await knex('class_user').del();
  await knex('classes').del();
  await knex('users').where('role_id', PROFESSOR_ROLE_ID).del();
  await knex('users').where('role_id', STUDENT_ROLE_ID).del();
}