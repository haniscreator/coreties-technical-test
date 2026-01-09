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

// Mock Recharts (Not testing charts directly here, but need to prevent render issues)
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

// Hoist mocks


// Mock Stats Data
const statsDataMock = {
    stats: {
        totalImporters: 123,
        totalExporters: 456,
        totalShipments: 789,
        totalWeight: 1550000 // 1550k
    },
    monthlyVolume: [], // Not testing this chart
    topCommodities: [
        { commodity: 'Rubber', kg: 500000 },
        { commodity: 'Coffee', kg: 250000 },
    ],
    industryStats: []
};

// other mocks
const countriesMock = ['USA', 'Germany'];
const companyDataMock = { data: [], total: 0 };

vi.mock('swr', () => ({
    default: (key: string, _fetcher: unknown) => {
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

describe('Stats Cards Widget', () => {

    it('should render Total Companies stats correctly', async () => {
        render(<CompaniesPage />);

        // Verify Headers
        expect(screen.getByText('Total Companies')).toBeInTheDocument();
        expect(screen.getByText('Importers')).toBeInTheDocument();
        expect(screen.getByText('Exporters')).toBeInTheDocument();
        expect(screen.getByText('Total Weight')).toBeInTheDocument();

        // Verify Values
        // "123" Importers
        expect(screen.getByText('123')).toBeInTheDocument();
        // "456" Exporters
        expect(screen.getByText('456')).toBeInTheDocument();
        // "1550k" Total Weight (formatted: 1550000 / 1000 = 1550 + 'k')
        expect(screen.getByText('1550k')).toBeInTheDocument();

        // Verify Global Shipments footer text
        // "Global shipments: 789"
        expect(screen.getByText('Global shipments: 789')).toBeInTheDocument();
    });

    it('should render Top 5 Commodities correctly', async () => {
        render(<CompaniesPage />);

        expect(screen.getAllByText('Top 5 Commodities by Weight')[0]).toBeInTheDocument();

        // Verify list items
        expect(screen.getAllByText('Rubber')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Coffee')[0]).toBeInTheDocument();

        // Verify specific values (formatted)
        // 500000 -> 500k kg
        expect(screen.getAllByText('500k kg')[0]).toBeInTheDocument();
        // 250000 -> 250k kg
        expect(screen.getAllByText('250k kg')[0]).toBeInTheDocument();
    });
});
