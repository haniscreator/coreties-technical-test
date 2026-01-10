
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetcher } from '@/pages/companies';

describe('fetcher utility', () => {
    // Save original fetch
    const originalFetch = global.fetch;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return JSON data when response is OK', async () => {
        const mockData = { success: true };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        const result = await fetcher('/api/test');
        expect(result).toEqual(mockData);
    });

    it('should throw "Failed to fetch" when response is not OK', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server Error' })
        });

        await expect(fetcher('/api/test')).rejects.toThrow('Failed to fetch');
    });
});
