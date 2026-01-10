import React from "react";
import { Company } from "@/types/company";

interface CompanyListProps {
    companies: Company[];
    totalCompanies: number;
    page: number;
    totalPages: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;

    // Filter States
    search: string;
    setSearch: (value: string) => void;
    role: string;
    setRole: (value: string) => void;
    country: string;
    setCountry: (value: string) => void;
    countries: string[] | undefined;

    // Actions
    handleSearch: () => void;
    handleReset: () => void;
    showReset: boolean;

    // Sorting
    sortColumn: string;
    sortOrder: "asc" | "desc";
    handleSort: (column: string) => void;

    // Selection
    selectedCompany: string | null;
    setSelectedCompany: (name: string | null) => void;
}

export default function CompanyList({
    companies,
    totalCompanies,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    role,
    setRole,
    country,
    setCountry,
    countries,
    handleSearch,
    handleReset,
    showReset,
    sortColumn,
    sortOrder,
    handleSort,
    selectedCompany,
    setSelectedCompany,
}: CompanyListProps) {
    const limit = 50;

    return (
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg shadow">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Company List
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Click a company to view details
                </p>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Roles</option>
                        <option value="Importer">Importer</option>
                        <option value="Exporter">Exporter</option>
                        <option value="Both">Both</option>
                    </select>
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Countries</option>
                        {countries?.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
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

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th
                                className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 group"
                                onClick={() => handleSort("name")}
                            >
                                Company Name{" "}
                                {sortColumn === "name" ? (
                                    sortOrder === "asc" ? (
                                        "▲"
                                    ) : (
                                        "▼"
                                    )
                                ) : (
                                    <span className="text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        ↕
                                    </span>
                                )}
                            </th>
                            <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                                Country
                            </th>
                            <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                                Role
                            </th>
                            <th
                                className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 group"
                                onClick={() => handleSort("totalShipments")}
                            >
                                Shipments{" "}
                                {sortColumn === "totalShipments" ? (
                                    sortOrder === "asc" ? (
                                        "▲"
                                    ) : (
                                        "▼"
                                    )
                                ) : (
                                    <span className="text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        ↕
                                    </span>
                                )}
                            </th>
                            <th
                                className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 group"
                                onClick={() => handleSort("totalWeight")}
                            >
                                Total Weight{" "}
                                {sortColumn === "totalWeight" ? (
                                    sortOrder === "asc" ? (
                                        "▲"
                                    ) : (
                                        "▼"
                                    )
                                ) : (
                                    <span className="text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        ↕
                                    </span>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company: Company, idx: number) => (
                            <tr
                                key={idx}
                                onClick={() => setSelectedCompany(company.name)}
                                className={`border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors ${selectedCompany === company.name
                                        ? "bg-blue-50 dark:bg-blue-900/20"
                                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                    }`}
                            >
                                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                                    {company.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                    {company.country}
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                    {company.role}
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50 text-right">
                                    {company.totalShipments.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 text-right">
                                    {company.totalWeight.toLocaleString()} kg
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Showing {companies.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
                    {Math.min(page * limit, totalCompanies)} of{" "}
                    {totalCompanies.toLocaleString()} companies
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        className="px-3 py-1 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
