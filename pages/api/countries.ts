
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCountries } from '@/lib/data/countries';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string[] | { error: string }>
) {
    try {
        const countries = await getCountries();
        res.status(200).json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
}
