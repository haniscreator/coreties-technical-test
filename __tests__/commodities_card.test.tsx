import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CommoditiesCard from "@/components/companies/CommoditiesCard";

afterEach(() => {
    cleanup();
});

describe("CommoditiesCard Component", () => {
    const mockCommodities = [
        { commodity: "Rubber", kg: 500000 },
        { commodity: "Coffee", kg: 250000 },
    ];

    it("should render list of commodities correctly", () => {
        render(<CommoditiesCard topCommodities={mockCommodities} />);

        expect(screen.getByText("Top 5 Commodities by Weight")).toBeInTheDocument();

        // Check items
        expect(screen.getByText("Rubber")).toBeInTheDocument();
        expect(screen.getByText("Coffee")).toBeInTheDocument();

        // Check weights
        expect(screen.getByText("500k kg")).toBeInTheDocument();
        expect(screen.getByText("250k kg")).toBeInTheDocument();
    });

    it("should handle empty list", () => {
        render(<CommoditiesCard topCommodities={[]} />);
        expect(screen.getAllByText("Top 5 Commodities by Weight").length).toBe(1);
        // Should not crash
    });
});
