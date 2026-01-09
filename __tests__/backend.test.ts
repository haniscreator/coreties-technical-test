
import { describe, it, expect } from 'vitest';
import { transformShipmentsToCompanies } from '@/lib/data/shipments';
import { getGlobalStats } from '@/lib/data/analytics';

describe('Backend Logic', () => {

    describe('transformShipmentsToCompanies', () => {
        it('should return a list of companies with aggregated data', async () => {
            const companies = await transformShipmentsToCompanies();

            expect(companies).toBeDefined();
            expect(Array.isArray(companies)).toBe(true);
            expect(companies.length).toBeGreaterThan(0);

            const firstCompany = companies[0];
            expect(firstCompany).toHaveProperty('name');
            expect(firstCompany).toHaveProperty('totalShipments');
            expect(firstCompany).toHaveProperty('totalWeight');
            expect(firstCompany).toHaveProperty('role');

            // Check logical consistency
            expect(firstCompany.totalShipments).toBeGreaterThan(0);
            expect(firstCompany.totalWeight).toBeGreaterThan(0);
            expect(['Importer', 'Exporter', 'Both']).toContain(firstCompany.role);
        });
    });

    describe('getGlobalStats', () => {
        it('should return correct global statistics structure', async () => {
            const stats = await getGlobalStats();

            expect(stats).toBeDefined();
            expect(stats).toHaveProperty('totalImporters');
            expect(stats).toHaveProperty('totalExporters');
            expect(stats).toHaveProperty('totalShipments');
            expect(stats).toHaveProperty('totalWeight');

            expect(stats.totalShipments).toBeGreaterThan(0);
        });
    });
});
