import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface MonthlyVolumeData {
    month: string;
    kg: number;
    sort_date?: string;
}

interface MonthsCardProps {
    monthlyVolume: MonthlyVolumeData[];
}

export default function MonthsCard({ monthlyVolume }: MonthsCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
                Total Weight Shipped per Month (kg)
            </h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis
                            dataKey="month"
                            stroke="#71717a"
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            stroke="#71717a"
                            style={{ fontSize: "12px" }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#18181b",
                                border: "1px solid #27272a",
                                borderRadius: "6px",
                                color: "#fafafa",
                            }}
                            formatter={(value) => [
                                `${Number(value).toLocaleString()} kg`,
                                "Weight",
                            ]}
                        />
                        <Bar dataKey="kg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Aggregated by month
                </p>
            </div>
        </div>
    );
}
