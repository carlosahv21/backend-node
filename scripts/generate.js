import { promises as fs } from 'fs';
import path from 'path';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const files = [
    {
        suffix: 'Repository',
        dir: (domain, entity) => `src/domains/${domain}/${entity}`,
        template: (entitySingular, entityPlural) => `
import BaseModel from "../../shared/models/baseModel.js";

class ${entitySingular}Repository extends BaseModel {
    constructor() {
        super('${entityPlural.toLowerCase()}');
        this.joins = [];
        this.selectFields = ['${entityPlural.toLowerCase()}.*'];
        this.searchFields = ['${entityPlural.toLowerCase()}.name'];
    }
}

export default new ${entitySingular}Repository();
`},
    {
        suffix: 'Service',
        dir: (domain, entity) => `src/domains/${domain}/${entity}`,
        template: (entitySingular, entityPlural) => `
import ${entitySingular}Repository from './${entitySingular.toLowerCase()}.repository.js';

class ${entitySingular}Service {
    async getAll(queryParams) {
        return ${entitySingular}Repository.findAll(queryParams);
    }

    async getById(id) {
        return ${entitySingular}Repository.findById(id);
    }

    async create(data) {
        return ${entitySingular}Repository.create(data);
    }

    async update(id, data) {
        return ${entitySingular}Repository.update(id, data);
    }

    async bin(id) {
        return ${entitySingular}Repository.bin(id);
    }

    async restore(id) {
        return ${entitySingular}Repository.restore(id);
    }

    async delete(id) {
        return ${entitySingular}Repository.delete(id);
    }
}

export default new ${entitySingular}Service();
`},
    {
        suffix: 'Controller',
        dir: (domain, entity) => `src/domains/${domain}/${entity}`,
        template: (entitySingular, entityPlural) => `
import ${entitySingular}Service from './${entitySingular.toLowerCase()}.service.js';
import ApiResponse from "../../shared/utils/apiResponse.js";

class ${entitySingular}Controller {
    async getAll(req, res, next) {
        try {
            const result = await ${entitySingular}Service.getAll(req.query);
            ApiResponse.success(res, 200, "${entityPlural} retrieved successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entitySingular}Service.getById(id);
            ApiResponse.success(res, 200, "${entitySingular} retrieved successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const result = await ${entitySingular}Service.create(req.body);
            ApiResponse.success(res, 201, "${entitySingular} created successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entitySingular}Service.update(id, req.body);
            ApiResponse.success(res, 200, "${entitySingular} updated successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entitySingular}Service.bin(id);
            ApiResponse.success(res, 200, "${entitySingular} moved to bin successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entitySingular}Service.restore(id);
            ApiResponse.success(res, 200, "${entitySingular} restored successfully", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await ${entitySingular}Service.delete(id);
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
        suffix: 'Routes',
        dir: (domain, entity) => `src/domains/${domain}/${entity}`,
        template: (entitySingular, entityPlural) => `
import { Router } from 'express';
import ${entitySingular}Controller from './${entitySingular.toLowerCase()}.controller.js';
import authMiddleware from '../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'view'),
    (req, res, next) => ${entitySingular}Controller.getAll(req, res, next)
);

router.get('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'view'),
    (req, res, next) => ${entitySingular}Controller.getById(req, res, next)
);

router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'create'),
    (req, res, next) => ${entitySingular}Controller.create(req, res, next)
);

router.put('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'edit'),
    (req, res, next) => ${entitySingular}Controller.update(req, res, next)
);

router.patch('/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'delete'),
    (req, res, next) => ${entitySingular}Controller.bin(req, res, next)
);

router.patch('/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'delete'),
    (req, res, next) => ${entitySingular}Controller.restore(req, res, next)
);

router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('${entityPlural.toLowerCase()}', 'delete'),
    (req, res, next) => ${entitySingular}Controller.delete(req, res, next)
);

export default router;
`},
];

const DOMAIN_MAP = {
    security: ['auth', 'users', 'roles', 'permissions', 'rolePermissions', 'routes'],
    academy: ['academies', 'students', 'teachers', 'classes', 'attendance', 'blocks', 'connections', 'studentStats', 'teacherReviews', 'achievements', 'userAchievements', 'challenges', 'userChallenges'],
    billing: ['plans', 'payments', 'registrations'],
    fields: ['fields', 'modules'],
    notifications: ['notifications'],
    reports: ['reports'],
    search: ['search'],
    settings: ['settings']
};

function getDomainForEntity(entityPlural) {
    for (const [domain, entities] of Object.entries(DOMAIN_MAP)) {
        if (entities.includes(entityPlural.toLowerCase())) {
            return domain;
        }
    }
    return 'academy';
}

async function generateModule() {
    const entityPluralInput = process.argv[2];

    if (!entityPluralInput) {
        console.error('❌ ERROR: Debes proporcionar el nombre de la entidad (en plural) como argumento.');
        console.log('Ejemplo de uso: node scripts/generate.js categorias');
        console.log('Dominios disponibles: ' + Object.keys(DOMAIN_MAP).join(', '));
        return;
    }

    const entityPlural = entityPluralInput.toLowerCase();
    let entitySingular;

    if (entityPlural.endsWith('s')) {
        entitySingular = capitalize(entityPlural.slice(0, -1));
    } else {
        console.warn('⚠️ ADVERTENCIA: Se esperaba nombre de entidad en plural (terminado en "s").');
        entitySingular = capitalize(entityPlural);
    }

    const domain = getDomainForEntity(entityPlural);

    console.log(`\n✨ Iniciando generación para la entidad: ${entityPlural}`);
    console.log(`  - Nombre singular (Clase): ${entitySingular}`);
    console.log(`  - Dominio: ${domain}\n`);

    for (const fileDef of files) {
        const { dir, suffix, template } = fileDef;

        const fullDirPath = path.join('.', dir(domain, entityPlural));
        const fileName = `${entityPlural}.${suffix.toLowerCase()}.js`;
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
    console.log('  1. Importar el nuevo router en src/routes/index.js');
    console.log('  2. Agregar el módulo a db/data/blocksData.js y fieldsData.js si es necesario');
}

generateModule();