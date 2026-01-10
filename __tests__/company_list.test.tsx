
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompaniesPage from '@/pages/companies';

// Mock Navigation
vi.mock('@/components/Navigation', () => ({
    default: () => <div data-testid="navigation">Navigation</div>
}));

// Mock CompanyDetail
vi.mock('@/components/companies/CompanyDetail', () => ({
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

// Mock Data
const mockCompanies = [
    { name: 'Company A', country: 'USA', totalShipments: 10, totalWeight: 1000, role: 'Importer' },
    { name: 'Company B', country: 'Germany', totalShipments: 20, totalWeight: 2000, role: 'Exporter' },
];

const companyDataMock = { data: mockCompanies, total: 2 };
const statsDataMock = {
    stats: { totalImporters: 10, totalExporters: 5, totalShipments: 100, totalWeight: 50000 },
    monthlyVolume: [],
    topCommodities: [],
    industryStats: []
};
const countriesMock = ['USA', 'Germany'];

const fetcherMock = vi.fn();

vi.mock('swr', () => ({
    default: (key: string) => {
        if (key === '/api/stats') {
            return { data: statsDataMock, isLoading: false };
        }
        if (key === '/api/countries') {
            return { data: countriesMock, isLoading: false };
        }
        if (key && key.includes('/api/companies')) {
            fetcherMock(key);
            return { data: companyDataMock, isLoading: false };
        }
        return { data: null, isLoading: false };
    }
}));

describe('Company List Widget', () => {
    beforeEach(() => {
        fetcherMock.mockClear();
    });

    it('should select a company row when clicked', async () => {
        render(<CompaniesPage />);

        // Find rows by company name (async to wait for SWR)
        const rowA = (await screen.findByText('Company A')).closest('tr');
        const rowB = (await screen.findByText('Company B')).closest('tr');

        expect(rowA).toBeInTheDocument();
        expect(rowB).toBeInTheDocument();

        // Initial state: no selection
        expect(rowA?.className).not.toContain('bg-blue-50');

        // Click Row A
        fireEvent.click(rowA!);

        // Verify Row A is selected
        expect(rowA?.className).toContain('bg-blue-50');
        // Row B should not be selected
        expect(rowB?.className).not.toContain('bg-blue-50');
    });

    it('should trigger sort when column header is clicked', async () => {
        render(<CompaniesPage />);

        // Use regex to match header text avoiding sort icons
        const nameHeaders = screen.getAllByRole('columnheader', { name: /Company Name/i });
        const nameHeader = nameHeaders[0]; // Handle potential duplicates (e.g. mobile/desktop views)
        fireEvent.click(nameHeader);

        // Verify API call for sort
        await waitFor(() => {
            const lastCall = fetcherMock.mock.calls[fetcherMock.mock.calls.length - 1][0];
            expect(lastCall).toContain('sort=name');
            expect(lastCall).toContain('order=desc');
        });

        // Click again to toggle order
        fireEvent.click(nameHeader);
        await waitFor(() => {
            const lastCall = fetcherMock.mock.calls[fetcherMock.mock.calls.length - 1][0];
            expect(lastCall).toContain('sort=name');
            expect(lastCall).toContain('order=asc');
        });
    });
});
