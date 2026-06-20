import { describe, it, expect } from 'vitest';
import { buildPermissionMap } from '../shared/utils/permissionMapper.js';

describe('buildPermissionMap', () => {
    it('agrupa acciones por módulo conservando el scope', () => {
        const raw = [
            { moduleName: 'students', action: 'view', scope: 'all' },
            { moduleName: 'students', action: 'create', scope: 'all' },
            { moduleName: 'payments', action: 'view', scope: 'own' },
        ];
        expect(buildPermissionMap(raw)).toEqual({
            students: { actions: ['view', 'create'], scope: 'all' },
            payments: { actions: ['view'], scope: 'own' },
        });
    });

    it('no duplica acciones repetidas', () => {
        const raw = [
            { moduleName: 'students', action: 'view', scope: 'all' },
            { moduleName: 'students', action: 'view', scope: 'all' },
        ];
        expect(buildPermissionMap(raw).students.actions).toEqual(['view']);
    });

    it('retorna un mapa vacío para una entrada vacía', () => {
        expect(buildPermissionMap([])).toEqual({});
    });
});
