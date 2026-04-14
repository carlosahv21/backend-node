import knexfile from '../knexfile.js';
import knexFactory from 'knex';
import fs from 'fs';
import path from 'path';

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];
const knex = knexFactory(config);

// Control mediante variables de entorno
const SQL_DEBUG = process.env.SQL_DEBUG === 'true';

if (SQL_DEBUG) {
    const logDir = path.join(process.cwd(), 'logs');

    // Asegurar existencia de carpeta /logs
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    // 1. Registro de Consultas (Historial General)
    knex.on('query', (queryData) => {
        const timestamp = new Date().toISOString();
        const date = timestamp.split('T')[0];
        const logFile = path.join(logDir, `sql-history-${date}.log`);

        const logMessage = `[${timestamp}]
SQL: ${queryData.sql}
PARAMS: ${JSON.stringify(queryData.bindings)}
------------------------------------------------------------------\n`;

        fs.appendFile(logFile, logMessage, () => { });
    });

    // 2. Registro de Errores (Detección de Fallos)
    knex.on('query-error', (error, obj) => {
        const timestamp = new Date().toISOString();
        const errorFile = path.join(logDir, `sql-errors-${timestamp.split('T')[0]}.log`);

        const errorMessage = `[${timestamp}] ❌ ERROR DETECTADO
MENSAJE: ${error.message}
SQL: ${obj.sql}
PARAMS: ${JSON.stringify(obj.bindings)}
CÓDIGO: ${error.code || 'N/A'}
------------------------------------------------------------------\n`;

        fs.appendFile(errorFile, errorMessage, () => {
            // Alerta visual en la terminal de desarrollo
            console.error(`\x1b[31m[SQL Error]\x1b[0m Revisar logs/sql-errors.log`);
        });
    });
}

export default knex;