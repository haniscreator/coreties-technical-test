
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCompanyDetails } from '@/lib/data/analytics';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Company name is required' });
    }

    try {
        const details = await getCompanyDetails(name);
        res.status(200).json(details);
    } catch (error) {
        console.error(`Error fetching details for company ${name}:`, error);
        res.status(500).json({ error: 'Failed to fetch company details' });
    }
}
