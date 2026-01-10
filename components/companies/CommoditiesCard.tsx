import React from "react";

interface Commodity {
    commodity: string;
    kg: number;
}

interface CommoditiesCardProps {
    topCommodities: Commodity[];
}

export default function CommoditiesCard({
    topCommodities,
}: CommoditiesCardProps) {
    return (
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
    );
}
