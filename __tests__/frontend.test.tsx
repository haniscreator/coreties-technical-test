import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompanyDetail from '@/components/companies/CompanyDetail';

// Mock Recarts to avoid sizing issues in jsdom

// Mock Recarts to avoid sizing issues in jsdom
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div className="recharts-responsive-container">{children}</div>,
    BarChart: () => <div className="recharts-bar-chart" />,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    PieChart: () => null,
    Pie: () => null,
    Cell: () => null,
    Legend: () => null,
}));

// Mock SWR to control data fetching
const mockSWR = vi.fn();
// Default mock behavior
// Default mock behavior
mockSWR.mockReturnValue({ data: null, isLoading: false });

vi.mock('swr', () => ({
    default: (key: string) => {
        // Return different data based on key type
        if (key === '/api/stats') {
            return {
                data: {
                    stats: { totalImporters: 10, totalExporters: 5, totalShipments: 100, totalWeight: 50000 },
                    monthlyVolume: [],
                    topCommodities: [],
                    industryStats: []
                },
                isLoading: false
            };
        }
        if (key === '/api/countries') {
            return { data: ['USA', 'Germany', 'China'], isLoading: false };
        }
        if (key && key.includes('/api/companies')) {
            return mockSWR(key) || { data: { data: [], total: 0 }, isLoading: false };
        }
        return { data: null, isLoading: false };
    }
}));

describe('Frontend Components', () => {

    describe('CompanyDetail', () => {
        it('should render empty state when no company is selected', () => {
            render(<CompanyDetail company={null} />);
            expect(screen.getByText('Select a company to view details')).toBeInTheDocument();
        });

        it('should render company basic info when company is provided', () => {
            const company = {
                name: 'Test Corp',
                country: 'Test Land',
                website: 'https://test.com',
                totalShipments: 100,
                totalWeight: 5000,
                role: 'Importer' as const
            };

            // Mock SWR response for details
            mockSWR.mockReturnValue({ data: null, isLoading: true });

            render(<CompanyDetail company={company} />);

            expect(screen.getByText('Test Corp')).toBeInTheDocument();
            expect(screen.getByText('Test Land')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument(); // Shipments
            expect(screen.getByText('5.0k')).toBeInTheDocument(); // Weight in k
            expect(screen.getByText('Loading details...')).toBeInTheDocument();
        });
    });

});
