import { query } from '@/lib/data/shipments';

/**
 * Fetches a list of unique countries from the shipments data.
 * Combines both importer and exporter countries.
 */
export async function getCountries(): Promise<string[]> {
    const result = await query<{ country: string }>(`
        SELECT DISTINCT country FROM (
            SELECT importer_country as country FROM shipments
            UNION
            SELECT exporter_country as country FROM shipments
        ) 
        WHERE country IS NOT NULL
        ORDER BY country ASC
    `);

    return result.map(r => r.country);
}
