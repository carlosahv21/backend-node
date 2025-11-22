// config/knex.js
import knexfile from '../knexfile.js';
import knexFactory from 'knex';

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

const knex = knexFactory(config);

export default knex;