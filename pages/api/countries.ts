
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/data/shipments';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string[] | { error: string }>
) {
    try {
        const result = await query<{ country: string }>(`
            SELECT DISTINCT country FROM (
                SELECT importer_country as country FROM shipments
                UNION
                SELECT exporter_country as country FROM shipments
            ) 
            WHERE country IS NOT NULL
            ORDER BY country ASC
        `);

        const countries = result.map(r => r.country);
        res.status(200).json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
}
