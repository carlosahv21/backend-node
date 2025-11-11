const knex = require('knex');

const db = knex({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306, // El puerto por defecto es 3306 para MySQL
    },
});
const db_version = await db('database_version').first('version');
// knexfile.js
module.exports = {
    development: {
        client: 'mysql2', // o 'pg', 'sqlite3', según tu caso
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'backend_db',
        },
        migrations: {
            directory: './migrations/'+db_version, // <-- importante
            extension: 'js'
        },
        seeds: {
            directory: './seeds'
        }
    }
};
