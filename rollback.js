require("dotenv").config();
const knex = require("knex");
const fs = require("fs");
const path = require("path");

// Configuración de knex con MySQL
const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
});

// Función para obtener la versión actual de la base de datos
async function getCurrentVersion() {
  const result = await db("database_version").first("version");
  return result.version;
}

// Función para obtener la versión anterior disponible
function getPreviousVersion(currentVersion) {
  const migrationsDir = path.resolve(__dirname, "migrations");
  const availableVersions = fs
    .readdirSync(migrationsDir)
    .filter((file) =>
      fs.statSync(path.join(migrationsDir, file)).isDirectory()
    );

  // Ordenar las versiones y obtener la versión anterior
  availableVersions.sort();
  const currentIndex = availableVersions.indexOf(currentVersion);

  if (currentIndex > 0) {
    return availableVersions[currentIndex - 1];
  }

  return null; // No hay versiones anteriores
}

// Función para actualizar la versión en la tabla database_version
async function updateVersion(newVersion) {
  await db("database_version").update({ version: newVersion });
}

// Función principal para hacer rollback de una versión
async function rollbackDatabase() {
  try {
    // Obtener la versión actual
    const currentVersion = await getCurrentVersion();
    console.log(`Versión actual de la base de datos: ${currentVersion}`);

    // Obtener la versión anterior
    const previousVersion = getPreviousVersion(currentVersion);

    if (!previousVersion) {
      console.log("No hay versiones anteriores a las que revertir.");
      return;
    }

    console.log(`Revirtiendo migraciones a la versión: ${previousVersion}`);

    const migrationsPath = path.join(__dirname, "migrations", currentVersion);

    // Revertir las migraciones de la versión actual
    await db.migrate.rollback({
      directory: migrationsPath,
    });

    // Actualizar la versión en la tabla database_version
    await updateVersion(previousVersion);
    console.log(
      `La base de datos ha sido revertida a la versión: ${previousVersion}`
    );
  } catch (err) {
    console.error("Error durante el rollback de la migración:", err);
  } finally {
    // Cerrar la conexión a la base de datos
    db.destroy();
  }
}

// Ejecutar la función de rollback
rollbackDatabase();
