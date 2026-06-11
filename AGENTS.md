# AGENTS.md — Passo Backend

## Quick Commands

```bash
npm run dev          # Start with nodemon (port 3000)
npm run migrate      # Custom versioned migration runner
npm run seed         # Seed via knex (creates fake data)
npm run generate <entity>  # Scaffold model/service/controller/route
```

No lint, typecheck, or test framework is configured.

## Critical Facts

**ES Modules everywhere.** `"type": "module"` in package.json. All local imports must use `.js` extensions. The code generator (`scripts/generate.js`) also emits `.js` extensions.

**Database is PostgreSQL**, not MySQL. The README is outdated. All Knex config uses `client: 'pg'`. Use `pg` syntax for any raw SQL.

**Multi-tenant via `academy_id`.** Most tenant tables have an `academy_id` FK to `academies`. The `BaseModel` auto-applies tenant filtering using `getCurrentTenantId()` from `utils/tenantContext.js`. Do NOT hardcode academy IDs. When querying outside HTTP context (seeds, cron), `getCurrentTenantId()` returns null.

**Global tables** (no tenant filtering): `roles`, `permissions`, `modules`, `role_permissions`, `database_version`. See `models/baseModel.js:12` for the full set.

**Custom migration runner** (`db/migration/migrate.js`). Version folders (e.g., `v1.0/`) are scanned lexicographically. Adding new files to an existing version folder works because the runner now uses `v >= currentVersion` (not `>`). Individual files are tracked by knex's `knex_migrations` table within each folder. Timestamp format: `YYYYMMDDHHMMSS_description.js`.

**Soft delete pattern.** Most tables have `deleted_at` (timestamp) and `deleted_by` (UUID FK to users). Use `.whereNull('deleted_at')` for active records. The BaseModel has `bin()`, `restore()`, `delete()` methods.

**RBAC system.** Auth via JWT (`middlewares/authMiddleware.js`). Routes use `authorize(module, action)` where action is one of: `create`, `view`, `edit`, `delete`. Scope can be `all`, `own`, or `assigned`. Permission cache is per-user.

## Architecture

```
controllers/   → Request handlers (thin, delegate to services)
services/      → Business logic
models/        → Base model with tenant-aware queries (extends BaseModel)
routes/        → Express routers with auth middleware
middlewares/   → auth, errorHandler, rateLimiter
utils/         → ApiResponse, AppError, cache, tenantContext, permissionMapper
db/data/       → blocksData.js, fieldsData.js (seeded during table creation)
db/seeds/      → create_fake_data.js (npx knex seed:run)
db/migration/  → Versioned folders with Knex migrations
scripts/       → generate.js (scaffold new modules)
```

## Code Generation

```bash
npm run generate roles    # Creates: models/rolesModel.js, services/rolesService.js,
                          #          controllers/rolesController.js, routes/rolesRoute.js
```

After generating, you must:
1. Import the new route in `index.js`
2. Add the module to the modules seed if it's a new entity
3. Add blocks/fields in `db/data/blocksData.js` and `db/data/fieldsData.js` if the entity needs a dynamic form

## API Response Format

All endpoints use `utils/apiResponse.js`:
```js
ApiResponse.success(res, 200, "Message", data);  // { success: true, message, data }
ApiResponse.error(res, status, message);          // { success: false, message }
```

## EAV System (Dynamic Forms)

`modules` → `blocks` → `fields` → `field_values` allows runtime form configuration per module. Blocks group fields visually; fields define type/options/validation. The `field_values` table stores actual values keyed by `record_id`.

## Environment

Copy `.env_example` to `.env`. Required vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`, `PORT`. The `CORS_ORIGIN` var defaults to `*`.
