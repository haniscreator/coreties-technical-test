
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CompaniesPage from '@/pages/companies';

// Mock Navigation
vi.mock('@/components/Navigation', () => ({
    default: () => <div data-testid="navigation">Navigation</div>
}));

// Mock CompanyDetail
vi.mock('@/components/CompanyDetail', () => ({
    default: () => <div data-testid="company-detail">Company Detail</div>
}));

// Mock Recharts specifically to allow testing data rendering
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
    // Mock BarChart to actually render its data so we can assert it exists in the DOM
    BarChart: ({ data, children }: any) => (
        <div data-testid="bar-chart">
            {data?.map((item: any) => (
                <div key={item.month} data-testid="chart-item">
                    <span>{item.month}</span>
                    <span>{item.kg}</span>
                </div>
            ))}
            {children}
        </div>
    ),
    Bar: () => <div data-testid="chart-bar" />,
    PieChart: () => null,
    Pie: () => null,
    Cell: () => null,
    Legend: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
}));

// Mock SWR Data
const statsDataMock = {
    stats: {
        totalImporters: 10, totalExporters: 10, totalShipments: 100, totalWeight: 50000
    },
    monthlyVolume: [
        { month: 'Jan 2024', kg: 1000, sort_date: '2024-01-01' },
        { month: 'Feb 2024', kg: 2000, sort_date: '2024-02-01' },
        { month: 'Mar 2024', kg: 1500, sort_date: '2024-03-01' },
    ],
    topCommodities: [],
    industryStats: []
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

describe('Chart Widget', () => {
    it('should render the monthly volume chart with correct data', async () => {
        render(<CompaniesPage />);

        // Verify Chart Container exists
        expect(screen.getAllByTestId('chart-container')[0]).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

        // Verify Axis Labels (Months) are rendered (via our mock)
        expect(screen.getByText('Jan 2024')).toBeInTheDocument();
        expect(screen.getByText('Feb 2024')).toBeInTheDocument();
        expect(screen.getByText('Mar 2024')).toBeInTheDocument();

        // Verify Header
        expect(screen.getByText('Total Weight Shipped per Month (kg)')).toBeInTheDocument();
    });
});
