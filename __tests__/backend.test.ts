
import { describe, it, expect } from 'vitest';
import { transformShipmentsToCompanies, loadShipments } from '@/lib/data/shipments';
import { getGlobalStats, getTopCommodities, getMonthlyVolume, getCompanyDetails, getIndustryStats } from '@/lib/data/analytics';
import { getCountries } from '@/lib/data/countries';

describe('Backend Logic', () => {

    describe('loadShipments', () => {
        it('should filter by minWeight (>= default)', async () => {
            const { data } = await loadShipments({ minWeight: 10, sort: 'weight_metric_tonnes', order: 'asc' });
            expect(data.length).toBeGreaterThan(0);
            data.forEach(s => {
                expect(s.weight_metric_tonnes).toBeGreaterThanOrEqual(10);
            });
        });

        it('should filter by weight operator <=', async () => {
            const { data } = await loadShipments({ minWeight: 50, weightOperator: '<=', sort: 'weight_metric_tonnes', order: 'desc' });
            expect(data.length).toBeGreaterThan(0);
            data.forEach(s => {
                expect(s.weight_metric_tonnes).toBeLessThanOrEqual(50);
            });
        });

        it('should filter by weight operator =', async () => {
            // Find a weight that exists first
            const { data: all } = await loadShipments({ limit: 1 });
            const weight = all[0].weight_metric_tonnes;

            const { data } = await loadShipments({ minWeight: weight, weightOperator: '=', sort: 'weight_metric_tonnes', order: 'asc' });
            expect(data.length).toBeGreaterThan(0);
            data.forEach(s => {
                expect(s.weight_metric_tonnes).toBe(weight);
            });
        });
    });

    describe('getCountries', () => {
        it('should return a list of unique countries sorted alphabetically', async () => {
            const countries = await getCountries();

            expect(countries).toBeDefined();
            expect(Array.isArray(countries)).toBe(true);
            expect(countries.length).toBeGreaterThan(0);

            // Check uniqueness and sorting
            const unique = new Set(countries);
            expect(unique.size).toBe(countries.length);

            for (let i = 0; i < countries.length - 1; i++) {
                expect(countries[i].localeCompare(countries[i + 1])).toBeLessThanOrEqual(0);
            }
        });
    });

    describe('transformShipmentsToCompanies', () => {
        it('should return a list of companies with aggregated data', async () => {
            const { data: companies } = await transformShipmentsToCompanies();

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

    describe('getTopCommodities', () => {
        it('should return top 5 commodities sorted by weight', async () => {
            const commodities = await getTopCommodities();

            expect(commodities).toBeDefined();
            expect(Array.isArray(commodities)).toBe(true);
            expect(commodities.length).toBeLessThanOrEqual(5);

            if (commodities.length > 0) {
                const firstCommodity = commodities[0];
                expect(firstCommodity).toHaveProperty('commodity');
                expect(firstCommodity).toHaveProperty('kg');
                expect(typeof firstCommodity.commodity).toBe('string');
                expect(typeof firstCommodity.kg).toBe('number');

                // Check sorting (descending)
                for (let i = 0; i < commodities.length - 1; i++) {
                    expect(commodities[i].kg).toBeGreaterThanOrEqual(commodities[i + 1].kg);
                }
            }
        });
    });

    describe('getMonthlyVolume', () => {
        it('should return monthly volume sorted chronologically', async () => {
            const volume = await getMonthlyVolume();

            expect(volume).toBeDefined();
            expect(Array.isArray(volume)).toBe(true);
            expect(volume.length).toBeGreaterThan(0);

            const firstEntry = volume[0];
            expect(firstEntry).toHaveProperty('month');
            expect(firstEntry).toHaveProperty('kg');
            expect(firstEntry).toHaveProperty('sort_date');
            expect(typeof firstEntry.kg).toBe('number');

            // Check sorting (chronological)
            for (let i = 0; i < volume.length - 1; i++) {
                const date1 = new Date(volume[i].sort_date).getTime();
                const date2 = new Date(volume[i + 1].sort_date).getTime();
                expect(date1).toBeLessThanOrEqual(date2);
            }
        });

        it('should match total weight with global stats', async () => {
            const [volume, stats] = await Promise.all([
                getMonthlyVolume(),
                getGlobalStats()
            ]);

            const sumVolume = volume.reduce((sum, entry) => sum + entry.kg, 0);

            // Allow for small floating point differences
            expect(sumVolume).toBeCloseTo(stats.totalWeight, 1);
        });
    });

    describe('getIndustryStats', () => {
        it('should return industry statistics sorted by weight', async () => {
            const stats = await getIndustryStats();

            expect(stats).toBeDefined();
            expect(Array.isArray(stats)).toBe(true);
            expect(stats.length).toBeGreaterThan(0);

            const firstEntry = stats[0];
            expect(firstEntry).toHaveProperty('sector');
            expect(firstEntry).toHaveProperty('weight');
            expect(typeof firstEntry.weight).toBe('number');

            // Check sorting (descending by weight)
            for (let i = 0; i < stats.length - 1; i++) {
                expect(stats[i].weight).toBeGreaterThanOrEqual(stats[i + 1].weight);
            }

            // Ensure no empty or null sectors
            stats.forEach(entry => {
                expect(entry.sector).toBeTruthy();
            });
        });
    });

    describe('getCompanyDetails', () => {
        it('should return correct top commodities and trading partners', async () => {
            const companyName = "ARNOLD UMFORMTECHNIK GmbH & Co. KG";
            const details = await getCompanyDetails(companyName);

            expect(details).toBeDefined();
            expect(details).toHaveProperty('topCommodities');
            expect(details).toHaveProperty('topTradingPartners');

            expect(Array.isArray(details.topCommodities)).toBe(true);
            expect(details.topCommodities.length).toBeLessThanOrEqual(5);
            expect(Array.isArray(details.topTradingPartners)).toBe(true);
            expect(details.topTradingPartners.length).toBeLessThanOrEqual(5);

            if (details.topCommodities.length > 0) {
                const commodity = details.topCommodities[0];
                expect(commodity).toHaveProperty('name');
                expect(commodity).toHaveProperty('weight');
                expect(typeof commodity.weight).toBe('number');
            }

            // This company plays a dual role or at least is an exporter
            if (details.topTradingPartners.length > 0) {
                const partner = details.topTradingPartners[0];
                expect(partner).toHaveProperty('name');
                expect(partner).toHaveProperty('country');
                expect(partner).toHaveProperty('shipments');
                expect(typeof partner.shipments).toBe('number');
            }
        });

        it('should return partners for an Importer', async () => {
            // Mann+Hummel acts as Importer from ARNOLD...
            const companyName = "Mann+Hummel Mexico S.A. de C.V.";
            const details = await getCompanyDetails(companyName);

            expect(details.topTradingPartners.some(p => p.name === "ARNOLD UMFORMTECHNIK GmbH & Co. KG")).toBe(true);
        });

        it('should return partners for an Exporter', async () => {
            // Ahlstrom... acts as Exporter to Avery Dennison
            const companyName = "Ahlstrom La Gere SAS Chemin";
            const details = await getCompanyDetails(companyName);

            expect(details.topTradingPartners.some(p => p.name === "Avery Dennison")).toBe(true);
        });

        it('should handle non-existent company gracefully', async () => {
            const details = await getCompanyDetails("GhostCorp");
            expect(details.topCommodities).toEqual([]);
            expect(details.topTradingPartners).toEqual([]);
        });

        it('should handle special characters in company name', async () => {
            // "O'Reilly" test
            const details = await getCompanyDetails("O'Reilly Auto Parts");
            // Should not throw error
            expect(Array.isArray(details.topCommodities)).toBe(true);
            expect(Array.isArray(details.topTradingPartners)).toBe(true);
        });
    });
});
