import { describe, it, expect } from 'vitest';
import { buildPermissionMap } from '../shared/utils/permissionMapper.js';

describe('buildPermissionMap', () => {
    it('agrupa acciones por módulo con scope por acción', () => {
        const raw = [
            { moduleName: 'students', action: 'view', scope: 'all' },
            { moduleName: 'students', action: 'create', scope: 'all' },
            { moduleName: 'payments', action: 'view', scope: 'own' },
        ];
        expect(buildPermissionMap(raw)).toEqual({
            students: { actions: { view: 'all', create: 'all' } },
            payments: { actions: { view: 'own' } },
        });
    });

    it('conserva scopes distintos para acciones del MISMO módulo', () => {
        // Caso que el modelo antiguo colapsaba: view=all pero edit=own.
        const raw = [
            { moduleName: 'classes', action: 'view', scope: 'all' },
            { moduleName: 'classes', action: 'edit', scope: 'own' },
            { moduleName: 'classes', action: 'create', scope: 'assigned' },
        ];
        expect(buildPermissionMap(raw)).toEqual({
            classes: { actions: { view: 'all', edit: 'own', create: 'assigned' } },
        });
    });

    it('no expone un scope a nivel de módulo', () => {
        const raw = [{ moduleName: 'students', action: 'view', scope: 'all' }];
        const map = buildPermissionMap(raw);
        expect(map.students.scope).toBeUndefined();
        expect(map.students.actions).toEqual({ view: 'all' });
    });

    it('la última fila gana si una acción se repite (no duplica)', () => {
        const raw = [
            { moduleName: 'students', action: 'view', scope: 'own' },
            { moduleName: 'students', action: 'view', scope: 'all' },
        ];
        expect(buildPermissionMap(raw).students.actions).toEqual({ view: 'all' });
    });

    it('retorna un mapa vacío para una entrada vacía', () => {
        expect(buildPermissionMap([])).toEqual({});
    });
});
