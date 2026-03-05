// utils/cache.js
import NodeCache from 'node-cache';

// TTL por defecto: 10 minutos (600 segundos)
// checkperiod: 120 segundos (limpieza de expirados)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export default cache;
