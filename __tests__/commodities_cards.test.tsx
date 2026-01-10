import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CommoditiesCards from "@/components/companies/CommoditiesCards";

afterEach(() => {
    cleanup();
});

describe("CommoditiesCards Component", () => {
    const mockCommodities = [
        { commodity: "Rubber", kg: 500000 },
        { commodity: "Coffee", kg: 250000 },
    ];

    it("should render list of commodities correctly", () => {
        render(<CommoditiesCards topCommodities={mockCommodities} />);

        expect(screen.getByText("Top 5 Commodities by Weight")).toBeInTheDocument();

        // Check items
        expect(screen.getByText("Rubber")).toBeInTheDocument();
        expect(screen.getByText("Coffee")).toBeInTheDocument();

        // Check weights
        expect(screen.getByText("500k kg")).toBeInTheDocument();
        expect(screen.getByText("250k kg")).toBeInTheDocument();
    });

    it("should handle empty list", () => {
        render(<CommoditiesCards topCommodities={[]} />);
        expect(screen.getAllByText("Top 5 Commodities by Weight").length).toBe(1);
        // Should not crash
    });
});
