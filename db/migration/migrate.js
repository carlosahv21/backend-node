import dotenv from 'dotenv';
import knexFactory from 'knex';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = knexFactory({
  client: 'pg', // Cambiado de 'mysql2' a 'pg'
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432, // Puerto estándar de PostgreSQL
  },
});

// Revisar tabla de versión
async function hasVersionTable() {
  return await db.schema.hasTable('database_version');
}

async function createVersionTable() {
  return await db.schema.createTable('database_version', table => {
    table.increments('id').primary();
    table.string('version', 10).notNullable();
    // En Postgres, db.fn.now() funciona perfectamente para TIMESTAMP
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });
}

async function getCurrentVersion() {
  // Knex maneja la selección de filas de forma agnóstica al motor
  const row = await db('database_version').orderBy('id', 'desc').first('version');
  return row ? row.version : null;
}

async function initializeVersion(version) {
  await db('database_version').insert({ version });
}

async function updateVersion(version) {
  // Es mejor práctica insertar una nueva fila o actualizar la última para mantener historial
  await db('database_version').update({ version, updated_at: db.fn.now() });
}

async function migrateDatabase() {
  try {
    if (!(await hasVersionTable())) {
      console.log('Creando tabla "database_version" en PostgreSQL...');
      await createVersionTable();
      await initializeVersion('v0.0');
      console.log('Versión inicial registrada');
    }

    const currentVersion = await getCurrentVersion();
    console.log('Versión actual detectada:', currentVersion);

    // Directorio de migraciones (db/migration)
    const migrationsDir = __dirname; 

    const availableVersions = fs.readdirSync(migrationsDir)
      .filter(f => {
        const fullPath = path.join(migrationsDir, f);
        return fs.statSync(fullPath).isDirectory();
      })
      .sort();

    const pendingVersions = availableVersions.filter(v => v > currentVersion);
    
    if (pendingVersions.length === 0) {
      console.log('No hay migraciones pendientes. El esquema está al día.');
      return;
    }

    for (const version of pendingVersions) {
      console.log(`🚀 Ejecutando migraciones de ${version}...`);

      // Ejecuta las migraciones contenidas en la subcarpeta (ej: v1.0)
      await db.migrate.latest({
        directory: path.join(migrationsDir, version),
      });

      await updateVersion(version);
      console.log(`✅ Base de datos actualizada a ${version}`);
    }

    console.log('Proceso de migración completado con éxito.');
    
  } catch (err) {
    console.error('❌ Error crítico en la migración:', err.message);
    process.exit(1); // Importante para que los scripts de npm detecten el fallo
  } finally {
    await db.destroy();
  }
}

migrateDatabase();