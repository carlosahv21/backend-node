import { promises as fs } from 'fs';
import path from 'path';

// Función auxiliar para capitalizar la primera letra (ej: 'categorias' -> 'Categorias')
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- 1. DEFINICIÓN DE ARCHIVOS Y CARPETAS ---

const files = [
    {
        dir: 'models', suffix: 'Model', template: (entitySingular, entityPlural) => `
import BaseModel from './baseModel.js';

class ${entitySingular}Model extends BaseModel {
    constructor() {
        super('${entityPlural.toLowerCase()}');
        this.joins = [];
        this.selectFields = ['${entityPlural.toLowerCase()}.*'];
        this.searchFields = ['${entityPlural.toLowerCase()}.name'];
    }
}

export default new ${entitySingular}Model();
`},
    {
        dir: 'services', suffix: 'Service', template: (entitySingular, entityPlural) => `
import ${entitySingular.toLowerCase()}Model from '../models/${entityPlural}Model.js';

const getAll${entityPlural} = async (queryParams) => {
    return ${entitySingular.toLowerCase()}Model.findAll(queryParams);
};

const get${entitySingular}ById = async (id) => {
    return ${entitySingular.toLowerCase()}Model.findById(id);
};

const create${entitySingular} = async (data) => {
    return ${entitySingular.toLowerCase()}Model.create(data);
};

const update${entitySingular} = async (id, data) => {
    return ${entitySingular.toLowerCase()}Model.update(id, data);
};

const bin${entitySingular} = async (id) => {
    return ${entitySingular.toLowerCase()}Model.bin(id);
};

const restore${entitySingular} = async (id) => {
    return ${entitySingular.toLowerCase()}Model.restore(id);
};

const delete${entitySingular} = async (id) => {
    return ${entitySingular.toLowerCase()}Model.delete(id);
};

export default {
    getAll${entityPlural},
    get${entitySingular}ById,
    create${entitySingular},
    update${entitySingular},
    bin${entitySingular},
    restore${entitySingular},
    delete${entitySingular},
};
`},
    {
        dir: 'controllers', suffix: 'Controller', template: (entitySingular, entityPlural) => `
import ${entityPlural.toLowerCase()}Service from '../services/${entityPlural}Service.js';
import ApiResponse from '../utils/apiResponse.js';

class ${entitySingular}Controller {
    async getAll(req, res, next) {
        try {
            const result = await ${entityPlural.toLowerCase()}Service.getAll${entityPlural}(req.query);
            ApiResponse.success(res, 200, "${entityPlural} retrieved successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entityPlural.toLowerCase()}Service.get${entitySingular}ById(id);
            ApiResponse.success(res, 200, "${entitySingular} retrieved successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const result = await ${entityPlural.toLowerCase()}Service.create${entitySingular}(req.body);
            ApiResponse.success(res, 201, "${entitySingular} created successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entityPlural.toLowerCase()}Service.update${entitySingular}(id, req.body);
            ApiResponse.success(res, 200, "${entitySingular} updated successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entityPlural.toLowerCase()}Service.bin${entitySingular}(id);
            ApiResponse.success(res, 200, "${entitySingular} moved to bin successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entityPlural.toLowerCase()}Service.restore${entitySingular}(id);
            ApiResponse.success(res, 200, "${entitySingular} restored successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entityPlural.toLowerCase()}Service.delete${entitySingular}(id);
            ApiResponse.success(res, 200, "${entitySingular} deleted permanently", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new ${entitySingular}Controller();
`},
    {
        dir: 'routes', suffix: 'Route', template: (entitySingular, entityPlural) => `
import { Router } from 'express';
import ${entitySingular.toLowerCase()}Controller from '../controllers/${entityPlural}Controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/${entityPlural.toLowerCase()}
router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'view'),
    (req, res, next) => ${entitySingular.toLowerCase()}Controller.getAll(req, res, next)
);

// GET /api/${entityPlural.toLowerCase()}/:id
router.get('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'view'),
    (req, res, next) => ${entitySingular.toLowerCase()}Controller.getById(req, res, next)
);

// POST /api/${entityPlural.toLowerCase()}
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'create'),
    (req, res, next) => ${entitySingular.toLowerCase()}Controller.create(req, res, next)
);

// PUT /api/${entityPlural.toLowerCase()}/:id
router.put('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'edit'),
    (req, res, next) => ${entitySingular.toLowerCase()}Controller.update(req, res, next)
);

// PATCH /api/${entityPlural.toLowerCase()}/:id/bin
router.patch('/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'delete'),
    (req, res, next) => ${entitySingular.toLowerCase()}Controller.bin(req, res, next)
);

// PATCH /api/${entityPlural.toLowerCase()}/:id/restore
router.patch('/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'delete'),
    (req, res, next) => ${entitySingular.toLowerCase()}Controller.restore(req, res, next)
);

// DELETE /api/${entityPlural.toLowerCase()}/:id
router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'delete'),
    (req, res, next) => ${entitySingular.toLowerCase()}Controller.delete(req, res, next)
);

export default router;
`},
];

// --- 2. LÓGICA DE GENERACIÓN ---

async function generateModule() {
    // El argumento de la entidad se espera en la posición 2 del array (posición 0 es 'node', 1 es 'generate.js')
    const entityPluralInput = process.argv[2];

    if (!entityPluralInput) {
        console.error('❌ ERROR: Debes proporcionar el nombre de la entidad (en plural) como argumento.');
        console.log('Ejemplo de uso: node scripts/generate.js categorias');
        return;
    }

    // Normalización de nombres
    const entityPlural = entityPluralInput.toLowerCase(); // ej: 'categorias'
    let entitySingular;

    if (entityPlural.endsWith('s')) {
        // Si termina en 's', asume singular sin 's' final, y lo capitaliza. ej: 'categorias' -> 'Categoria'
        entitySingular = capitalize(entityPlural.slice(0, -1));
    } else {
        // Si no termina en 's', lo capitaliza directamente. ej: 'usuario' -> 'Usuario'
        console.warn('⚠️ ADVERTENCIA: Se esperaba nombre de entidad en plural (terminado en "s").');
        entitySingular = capitalize(entityPlural);
    }

    const baseDir = '.';

    console.log(`\n✨ Iniciando generación para la entidad: ${entityPlural}`);
    console.log(`  - Nombre singular (Clase/Modelo): ${entitySingular}\n`);

    for (const fileDef of files) {
        const { dir, suffix, template } = fileDef;

        const fullDirPath = path.join(baseDir, dir);
        const fileName = `${entityPlural}${suffix}.js`;
        const fullFilePath = path.join(fullDirPath, fileName);

        try {
            await fs.mkdir(fullDirPath, { recursive: true });
            const content = template(entitySingular, entityPlural);
            await fs.writeFile(fullFilePath, content.trim());
            console.log(`✅ Creado: ${fullFilePath}`);

        } catch (error) {
            console.error(`❌ Error al crear ${fullFilePath}: ${error.message}`);
        }
    }

    console.log('\n🎉 ¡Generación de módulo completa!');
    console.log('💡 Recuerda:');
    console.log('  1. Implementar la validación completa en el servicio o un middleware.');
    console.log('  2. Importar el nuevo router en tu archivo principal (ej. server.js).');
}

generateModule();