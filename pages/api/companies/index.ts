
import type { NextApiRequest, NextApiResponse } from 'next';
import { transformShipmentsToCompanies } from '@/lib/data/shipments';
import { Company } from '@/types/company';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ data: Company[]; total: number } | { error: string }>
) {
    const { search, role, country, page, limit } = req.query;
    try {
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 50;

        const result = await transformShipmentsToCompanies(
            search as string,
            role as string,
            country as string,
            pageNum,
            limitNum
        );
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
}
