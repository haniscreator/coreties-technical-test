
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ data, children }: { data: { sector: string; weight: number }[]; children: React.ReactNode }) => (
        <div data-testid="pie">
            {data?.map((item: { sector: string; weight: number }) => (
                <div key={item.sector} data-testid="pie-slice">
                    <span>{item.sector}</span>
                    <span>{item.weight}</span>
                </div>
            ))}
            {children}
        </div>
    ),
    Cell: () => null,
    // Mock Legend to use the formatter prop if provided, which determines how items are rendered
    Legend: () => {
        // In real Recharts, payload is derived from data. Here we don't have it automatically passed to Legend mock unless we wire it.
        // However, we see in companies.tsx that the formatter uses `industryStats` from the scope, OR expects `entry.payload`.
        // Since we can't easily mock the internal state of Recharts passing payload to Legend,
        // we will simple mock the Legend to verify it is rendered, 
        // AND we will verify the data is passed to the Pie component above (which we mocked to render text).
        // 
        // BUT, to test the formatting logic "value (percent%)", we'd need to invoke the formatter.
        // Let's simplify: Verify the "Industry Sector Distribution" title and that the data is present in the DOM via the Pie mock.
        return <div data-testid="legend">Legend</div>;
    },
    Tooltip: () => null,
    BarChart: () => null,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
}));

// Mock SWR Data
const statsDataMock = {
    stats: { totalImporters: 10, totalExporters: 10, totalShipments: 100, totalWeight: 50000 },
    monthlyVolume: [],
    topCommodities: [],
    industryStats: [
        { sector: 'Technology', weight: 30000 },
        { sector: 'Agriculture', weight: 20000 },
    ]
};

// other mocks
const countriesMock = ['USA'];
const companyDataMock = { data: [], total: 0 };

vi.mock('swr', () => ({
    default: (key: string) => {
        if (key === '/api/stats') {
            return { data: statsDataMock, isLoading: false };
        }
        if (key === '/api/countries') {
            return { data: countriesMock, isLoading: false };
        }
        if (key && key.includes('/api/companies')) {
            return { data: companyDataMock, isLoading: false };
        }
        return { data: null, isLoading: false };
    }
}));

describe('Pie Chart Widget', () => {
    it('should render the industry sector chart with correct data', async () => {
        render(<CompaniesPage />);

        // Verify Header
        expect(screen.getByText('Industry Sector Distribution')).toBeInTheDocument();

        // Verify Chart Container
        // Note: There are 2 charts, so 2 containers. We use getAllByTestId
        const containers = screen.getAllByTestId('chart-container');
        expect(containers.length).toBeGreaterThanOrEqual(2);

        // Verify Pie Chart is present
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

        // Verify Data rendering (via our Pie mock)
        expect(screen.getByText('Technology')).toBeInTheDocument();
        // 30000
        expect(screen.getByText('30000')).toBeInTheDocument();

        expect(screen.getByText('Agriculture')).toBeInTheDocument();
        // 20000
        expect(screen.getByText('20000')).toBeInTheDocument();

        // Verify Custom Legend items are present
        // Since we removed the Recharts Legend, we check for the text in our custom legend div
        // We expect "Technology (60%)" and "Agriculture (40%)" given the total weight of 50000
        expect(screen.getByText('Technology (60%)')).toBeInTheDocument();
        expect(screen.getByText('Agriculture (40%)')).toBeInTheDocument();

        // Verify Footer
        expect(screen.getByText('Based on commodity mapping')).toBeInTheDocument();
    });
});
