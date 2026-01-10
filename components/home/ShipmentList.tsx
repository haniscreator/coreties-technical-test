import React from "react";
import { Shipment } from "@/types/shipment";

interface ShipmentListProps {
    shipments: Shipment[] | undefined;
    total: number;
    page: number;
    limit: number;
    setPage: (valor: number | ((prev: number) => number)) => void;
    sortColumn: string;
    sortOrder: "asc" | "desc";
    handleSort: (column: string) => void;
}

export default function ShipmentList({
    shipments,
    total,
    page,
    limit,
    setPage,
    sortColumn,
    sortOrder,
    handleSort,
}: ShipmentListProps) {
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                        <tr>
                            {[
                                { key: "id", label: "ID" },
                                { key: "importer_name", label: "Importer" },
                                { key: "importer_country", label: "Country" },
                                { key: "exporter_name", label: "Exporter" },
                                { key: "shipment_date", label: "Date" },
                                { key: "commodity_name", label: "Commodity" },
                                { key: "weight_metric_tonnes", label: "Weight (MT)" },
                            ].map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortColumn === col.key && (
                                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                        {shipments?.slice(0, 100).map((shipment) => (
                            <tr
                                key={shipment.id}
                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                    {shipment.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                    {shipment.importer_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                                    {shipment.importer_country}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                    {shipment.exporter_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                                    {shipment.shipment_date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                                    {shipment.commodity_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                                    {shipment.weight_metric_tonnes}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {(total > 0) && (
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
                        of {total.toLocaleString()} shipments
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
            )}
        </div>
    );
}
