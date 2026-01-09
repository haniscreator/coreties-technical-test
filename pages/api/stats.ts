
import type { NextApiRequest, NextApiResponse } from 'next';
import { getGlobalStats, getTopCommodities, getMonthlyVolume, getIndustryStats } from '@/lib/data/analytics';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const [stats, topCommodities, monthlyVolume, industryStats] = await Promise.all([
            getGlobalStats(),
            getTopCommodities(),
            getMonthlyVolume(),
            getIndustryStats(),
        ]);

        res.status(200).json({
            stats,
            topCommodities,
            monthlyVolume,
            industryStats,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
}
