import dotenv from 'dotenv';
import knexFactory from 'knex';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = knexFactory({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
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
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });
}

async function getCurrentVersion() {
  const row = await db('database_version').first('version');
  return row ? row.version : null;
}

async function initializeVersion(version) {
  await db('database_version').insert({ version });
}

async function updateVersion(version) {
  await db('database_version').update({ version });
}

async function migrateDatabase() {
  try {
    if (!(await hasVersionTable())) {
      console.log('Creando tabla "database_version"...');
      await createVersionTable();
      await initializeVersion('v0.0');
      console.log('Versión inicial "v1.0" registrada');
    }

    const currentVersion = await getCurrentVersion();
    console.log('Versión actual:', currentVersion);

    // Directorio de migraciones
    const migrationsDir = __dirname; // apunta a db/migration

    const availableVersions = fs.readdirSync(migrationsDir)
      .filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory())
      .sort();

    const pendingVersions = availableVersions.filter(v => v > currentVersion);
    if (pendingVersions.length === 0) {
      console.log('No hay migraciones pendientes.');
      return;
    }

    for (const version of pendingVersions) {
      console.log(`Ejecutando migraciones de ${version}...`);

      await db.migrate.latest({
        directory: path.join(migrationsDir, version),
      });

      await updateVersion(version);
      console.log(`Base de datos actualizada a ${version}`);
    }

    console.log('Migraciones completadas ✅');
    
  } catch (err) {
    console.error('Error en migración:', err);
  } finally {
    await db.destroy();
  }
}

migrateDatabase();
