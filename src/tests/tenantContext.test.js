import { describe, it, expect } from 'vitest';
import { runWithTenant, getCurrentTenantId } from '../shared/utils/tenantContext.js';

describe('tenantContext', () => {
    it('retorna null fuera de un contexto de petición', () => {
        expect(getCurrentTenantId()).toBeNull();
    });

    it('expone el academy_id dentro del contexto', () => {
        let captured;
        runWithTenant('academy-123', () => {
            captured = getCurrentTenantId();
        });
        expect(captured).toBe('academy-123');
    });

    it('aísla contextos anidados de distintos tenants', () => {
        const seen = [];
        runWithTenant('tenant-A', () => {
            seen.push(getCurrentTenantId());
            runWithTenant('tenant-B', () => {
                seen.push(getCurrentTenantId());
            });
            seen.push(getCurrentTenantId());
        });
        expect(seen).toEqual(['tenant-A', 'tenant-B', 'tenant-A']);
    });

    it('mantiene el contexto a través de operaciones asíncronas', async () => {
        const result = await new Promise((resolve) => {
            runWithTenant('async-tenant', () => {
                setTimeout(() => resolve(getCurrentTenantId()), 5);
            });
        });
        expect(result).toBe('async-tenant');
    });
});
