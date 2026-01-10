import React from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
];

interface MonthlyVolumeData {
    month: string;
    kg: number;
    sort_date?: string;
}

interface PieLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
}

interface ChartsSectionProps {
    monthlyVolume: MonthlyVolumeData[];
    industryStats: { sector: string; weight: number }[];
    industryTotalWeight: number;
}

export default function ChartsSection({
    monthlyVolume,
    industryStats,
    industryTotalWeight,
}: ChartsSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly KG Chart */}
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

            {/* Industry Distribution Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
                    Industry Sector Distribution
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-64 w-full sm:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={industryStats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="weight"
                                    nameKey="sector"
                                    label={({
                                        cx,
                                        cy,
                                        midAngle = 0,
                                        innerRadius,
                                        outerRadius,
                                        percent = 0,
                                    }: PieLabelProps) => {
                                        const radius =
                                            innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x =
                                            cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                                        const y =
                                            cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                                        return percent > 0.05 ? (
                                            <text
                                                x={x}
                                                y={y}
                                                fill="white"
                                                textAnchor={x > cx ? "start" : "end"}
                                                dominantBaseline="central"
                                                fontSize={12}
                                            >
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        ) : null;
                                    }}
                                >
                                    {industryStats.map(
                                        (
                                            entry: { sector: string; weight: number },
                                            index: number
                                        ) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        )
                                    )}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#18181b",
                                        border: "1px solid #27272a",
                                        borderRadius: "6px",
                                    }}
                                    itemStyle={{ color: "#e4e4e7" }}
                                    formatter={(value: number | undefined) => [
                                        `${((value || 0) / 1000).toFixed(1)}k kg`,
                                        "Weight",
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Custom Legend to ensure correct sorting order */}
                    <div className="w-full sm:w-1/2 grid grid-cols-1 gap-y-2 max-h-64 overflow-y-auto">
                        {industryStats.map((item, index) => {
                            const percent =
                                industryTotalWeight > 0
                                    ? ((item.weight / industryTotalWeight) * 100).toFixed(0)
                                    : "0";
                            return (
                                <div key={item.sector} className="flex items-center text-xs">
                                    <span
                                        className="w-3 h-3 mr-2 shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></span>
                                    <span className="text-zinc-600 dark:text-zinc-400 truncate">
                                        {item.sector} ({percent}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        Based on commodity mapping
                    </p>
                </div>
            </div>
        </div>
    );
}
