import React from "react";

interface Stats {
    totalImporters: number;
    totalExporters: number;
    totalShipments: number;
    totalWeight: number;
}

interface Commodity {
    commodity: string;
    kg: number;
}

interface StatsCardsProps {
    stats: Stats | undefined;
    topCommodities: Commodity[];
}

export default function StatsCards({ stats, topCommodities }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Companies Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                    Total Companies
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            {stats?.totalImporters?.toLocaleString() ?? "-"}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Importers
                        </p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            {stats?.totalExporters?.toLocaleString() ?? "-"}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Exporters
                        </p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            {stats?.totalWeight
                                ? `${(stats.totalWeight / 1000).toFixed(0)}k`
                                : "-"}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Total Weight
                        </p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        Global shipments: {stats?.totalShipments?.toLocaleString() ?? 0}
                    </p>
                </div>
            </div>

            {/* Top Commodities Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                    Top 5 Commodities by Weight
                </h2>
                <div className="space-y-3">
                    {topCommodities.map(
                        (item: { commodity: string; kg: number }, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-semibold text-zinc-400 dark:text-zinc-600">
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm text-zinc-900 dark:text-zinc-50">
                                        {item.commodity}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    {(item.kg / 1000).toFixed(0)}k kg
                                </span>
                            </div>
                        )
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        Top 5 by total weight
                    </p>
                </div>
            </div>
        </div>
    );
}
