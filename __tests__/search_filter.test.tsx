
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompaniesPage from '@/pages/companies';

// Mock Navigation
vi.mock('@/components/Navigation', () => ({
    default: () => <div data-testid="navigation">Navigation</div>
}));

vi.mock('@/components/CompanyDetail', () => ({
    default: () => <div data-testid="company-detail">Company Detail</div>
}));

// Mock Recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div className="recharts-responsive-container">{children}</div>,
    BarChart: () => null,
    Bar: () => null,
    PieChart: () => null,
    Pie: () => null,
    Cell: () => null,
    Legend: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
}));

// Mock SWR
// We use a mock function that we can configure per test if needed,
// but the factory handles the logic distribution.
const companyDataMock = { data: [], total: 0 };
const statsDataMock = {
    stats: { totalImporters: 10, totalExporters: 5, totalShipments: 100, totalWeight: 50000 },
    monthlyVolume: [],
    topCommodities: [],
    industryStats: []
};
const countriesMock = ['USA', 'Germany'];

const fetcherMock = vi.fn();

vi.mock('swr', () => ({
    default: (key: string, _fetcher: unknown) => {
        if (key === '/api/stats') {
            return { data: statsDataMock, isLoading: false };
        }
        if (key === '/api/countries') {
            return { data: countriesMock, isLoading: false };
        }
        if (key && key.includes('/api/companies')) {
            fetcherMock(key); // Track calls
            return { data: companyDataMock, isLoading: false };
        }
        return { data: null, isLoading: false };
    }
}));

describe('Search & Filter Widget', () => {
    beforeEach(() => {
        fetcherMock.mockClear();
    });

    it('should trigger search API call and support reset', async () => {
        render(<CompaniesPage />);

        const searchInput = screen.getByPlaceholderText('Search companies...');

        // 1. Enter search term
        fireEvent.change(searchInput, { target: { value: 'Tech' } });

        // 2. Select Role (assuming first select is Role)
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'Importer' } });

        // 3. Click Search
        fireEvent.click(screen.getByText('Search'));

        // Verify SWR was called with correct URL params
        await waitFor(() => {
            // We verify fetcherMock calls because we call it in the SWR factory
            expect(fetcherMock).toHaveBeenCalledWith(expect.stringContaining('search=Tech'));
            expect(fetcherMock).toHaveBeenCalledWith(expect.stringContaining('role=Importer'));
        });

        // 4. Verify Reset button is visible
        const resetButton = screen.getByText('Reset');
        expect(resetButton).toBeInTheDocument();

        // 5. Click Reset
        fireEvent.click(resetButton);

        // 6. Verify inputs cleared
        expect(searchInput).toHaveValue('');

        // 7. Verify API called with reset params
        await waitFor(() => {
            const lastCall = fetcherMock.mock.calls[fetcherMock.mock.calls.length - 1][0];
            expect(lastCall).toContain('search=&');
        });
    });
});
