
import type { NextApiRequest, NextApiResponse } from 'next';
import { transformShipmentsToCompanies } from '@/lib/data/shipments';
import { Company } from '@/types/company';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Company[] | { error: string }>
) {
    const { search, role } = req.query;
    try {
        const companies = await transformShipmentsToCompanies(search as string, role as string);
        res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
}
