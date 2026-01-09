
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompaniesPage from '@/pages/companies';

// Mock Navigation
vi.mock('@/components/Navigation', () => ({
    default: () => <div data-testid="navigation">Navigation</div>
}));

// Mock CompanyDetail
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

// Hoist mocks to ensure they are available in the factory
const hacks = vi.hoisted(() => {
    return {
        fetcherMock: vi.fn()
    };
});
const { fetcherMock } = hacks;

// Mock Data
// We need enough items to trigger pagination (limit is 50 usually, but we can simulate multiple pages via total)
const mockCompanies = Array(50).fill(null).map((_, i) => ({
    name: `Company ${i}`,
    country: 'USA',
    totalShipments: 10,
    totalWeight: 1000,
    role: 'Importer'
}));

const companyDataMockPage1 = { data: mockCompanies, total: 100 };
const companyDataMockPage2 = { data: mockCompanies, total: 100 }; // Same data for simplicity, we mock the call params

const statsDataMock = {
    stats: { totalImporters: 10, totalExporters: 5, totalShipments: 100, totalWeight: 50000 },
    monthlyVolume: [],
    topCommodities: [],
    industryStats: []
};
const countriesMock = ['USA', 'Germany'];

vi.mock('swr', () => ({
    default: (key: string) => {
        if (key === '/api/stats') {
            return { data: statsDataMock, isLoading: false };
        }
        if (key === '/api/countries') {
            return { data: countriesMock, isLoading: false };
        }
        if (key && key.includes('/api/companies')) {
            hacks.fetcherMock(key);
            // We can return different data based on page param if needed, but for now we check the call URL
            return { data: key.includes('page=2') ? companyDataMockPage2 : companyDataMockPage1, isLoading: false };
        }
        return { data: null, isLoading: false };
    }
}));

describe('Pagination Widget', () => {
    beforeEach(() => {
        fetcherMock.mockClear();
    });

    it('should navigate to next page and disable previous button on start', async () => {
        render(<CompaniesPage />);

        const nextButton = screen.getAllByRole('button', { name: 'Next' })[0];
        const prevButton = screen.getAllByRole('button', { name: 'Previous' })[0];

        // Initial State: Page 1
        expect(prevButton).toBeDisabled();
        expect(nextButton).not.toBeDisabled();

        // Click Next
        fireEvent.click(nextButton);

        // Expect API call for Page 2
        await waitFor(() => {
            const lastCall = fetcherMock.mock.calls[fetcherMock.mock.calls.length - 1][0];
            expect(lastCall).toContain('page=2');
        });

        // Previous button should now be enabled
        // Note: Enabling depends on state update refetch, which might be async. 
        // mocked SWR returns page 2 data immediately -> component re-renders -> disable logic updates
        // BUT page state update is separate.
        // Let's verifying visually or via disabled attribute

        // Wait for rerender if necessary, but fireEvent is usually synchronous for state updates
        // However, the button disabled state relies on `page` state variable.
    });

    it('should navigate to previous page', async () => {
        render(<CompaniesPage />);

        const nextButton = screen.getAllByRole('button', { name: 'Next' })[0];
        console.log('Next button disabled:', nextButton.hasAttribute('disabled'));
        const prevButton = screen.getAllByRole('button', { name: 'Previous' })[0];

        // Go to Page 2
        fireEvent.click(nextButton);

        // Wait for Previous button to be enabled (implies page > 1)
        await waitFor(() => {
            expect(prevButton).not.toBeDisabled();
        });

        // Go back to Page 1
        fireEvent.click(prevButton);

        // Wait for Previous button to be disabled (implies page === 1)
        await waitFor(() => {
            expect(prevButton).toBeDisabled();
        });
    });
});
