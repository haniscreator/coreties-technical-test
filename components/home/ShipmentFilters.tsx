import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ShipmentFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    startDateInput: Date | null;
    setStartDateInput: (date: Date | null) => void;
    endDateInput: Date | null;
    setEndDateInput: (date: Date | null) => void;
    minWeightInput: string;
    setMinWeightInput: (value: string) => void;
    weightOperator: string;
    setWeightOperator: (value: string) => void;
    showWeightOperator: boolean;
    setShowWeightOperator: (value: boolean) => void;
    handleSearch: () => void;
    handleReset: () => void;
    showReset: boolean;
}

export default function ShipmentFilters({
    searchInput,
    setSearchInput,
    startDateInput,
    setStartDateInput,
    endDateInput,
    setEndDateInput,
    minWeightInput,
    setMinWeightInput,
    weightOperator,
    setWeightOperator,
    showWeightOperator,
    setShowWeightOperator,
    handleSearch,
    handleReset,
    showReset,
}: ShipmentFiltersProps) {
    return (
        <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <input
                    type="text"
                    placeholder="Search by company or commodity..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full md:flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <DatePicker
                            selected={startDateInput}
                            onChange={(date: Date | null) => setStartDateInput(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Start Date"
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <span className="self-center text-zinc-500">-</span>
                    <div className="relative">
                        <DatePicker
                            selected={endDateInput}
                            onChange={(date: Date | null) => setEndDateInput(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="End Date"
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="number"
                            placeholder="Min Weight (MT)"
                            value={minWeightInput}
                            onChange={(e) => {
                                setMinWeightInput(e.target.value);
                                setShowWeightOperator(true);
                            }}
                            onFocus={() => setShowWeightOperator(true)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full md:w-32 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {showWeightOperator && (
                            <select
                                value={weightOperator}
                                onChange={(e) => setWeightOperator(e.target.value)}
                                className="w-20 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value=">=">{">="}</option>
                                <option value="=">=</option>
                                <option value="<=">{"<="}</option>
                            </select>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Search
                    </button>
                    {showReset && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
