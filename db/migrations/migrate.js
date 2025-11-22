// Importaciones de Módulos ES
import dotenv from 'dotenv';
import knexFactory from 'knex';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Corrección para __dirname en Módulos ES ---
// Obtenemos la ruta del archivo actual y luego el directorio.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Fin de corrección ---

// Cargar las variables de entorno 
dotenv.config();

// Configuración de knex con MySQL (Duplicada para uso programático)
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

// Función para verificar si la tabla database_version existe
async function hasVersionTable() {
  return await db.schema.hasTable('database_version');
}

// Función para crear la tabla database_version si no existe
async function createVersionTable() {
  return await db.schema.createTable('database_version', function (table) {
    table.increments('id').primary();
    table.string('version', 10).notNullable();
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });
}

// Función para inicializar la versión en la tabla database_version
async function initializeVersion(version) {
  return await db('database_version').insert({ version });
}

// Función para obtener la versión actual de la base de datos
async function getCurrentVersion() {
  const result = await db('database_version').first('version');
  return result ? result.version : null;
}

// Función para actualizar la versión en la tabla database_version
async function updateVersion(newVersion) {
  await db('database_version').update({ version: newVersion });
}

// Función principal para ejecutar migraciones
async function migrateDatabase() {
  try {
    const versionTableExists = await hasVersionTable();

    // Si la tabla "database_version" no existe, es la primera vez que se corre el sistema
    if (!versionTableExists) {
      console.log('Primera vez ejecutando el sistema. Creando la tabla "database_version"...');
      await createVersionTable();
      console.log('Tabla "database_version" creada.');

      // Inicializar con la versión 1.0
      await initializeVersion('v1.0');
      console.log('Versión inicial "v1.0" registrada en la base de datos.');
    }

    // Obtener la versión actual de la base de datos
    const currentVersion = await getCurrentVersion();
    console.log(`Versión actual de la base de datos: ${currentVersion}`);

    const migrationsDir = path.resolve(__dirname, 'migrations');

    let availableVersions = [];
    try {
      availableVersions = fs.readdirSync(migrationsDir)
        .filter(file => fs.statSync(path.join(migrationsDir, file)).isDirectory());
    } catch (e) {
      console.warn(`Advertencia: No se encontró el directorio de migraciones en ${migrationsDir}.`);
      return;
    }


    // Ordenar las versiones de menor a mayor
    availableVersions.sort();

    // Filtrar versiones que aún no han sido aplicadas
    const pendingVersions = availableVersions.filter(version => version > currentVersion);

    if (pendingVersions.length === 0) {
      console.log('No hay migraciones pendientes. La base de datos ya está en la última versión.');
      return;
    }

    // Ejecutar migraciones por cada versión pendiente
    for (const version of pendingVersions) {
      console.log(`Ejecutando migraciones para la versión: ${version}`);

      const migrationsPath = path.join(migrationsDir, version);
      await db.migrate.latest({
        directory: migrationsPath,
      });

      // Actualizar la versión en la tabla database_version
      await updateVersion(version);
      console.log(`Actualizada la base de datos a la versión: ${version}`);
    }

    console.log('Migraciones completadas. La base de datos está en la última versión.');
  } catch (err) {
    console.error('Error durante la migración:', err);
  } finally {
    await db.destroy();
  }
}

// Ejecutar la función de migración
migrateDatabase();