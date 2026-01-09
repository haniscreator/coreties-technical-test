import { useState } from "react";
import { Company } from "@/types/company";
import Navigation from "@/components/Navigation";
import CompanyDetail from "@/components/CompanyDetail";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Data fetching hooks
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [country, setCountry] = useState("All");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("totalWeight");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRole, setAppliedRole] = useState("All");
  const [appliedCountry, setAppliedCountry] = useState("All");

  const limit = 50;

  const handleSearch = () => {
    setAppliedSearch(search);
    setAppliedRole(role);
    setAppliedCountry(country);
    setPage(1);
    setSelectedCompany(null);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  const handleReset = () => {
    setSearch("");
    setRole("All");
    setCountry("All");
    setAppliedSearch("");
    setAppliedRole("All");
    setAppliedCountry("All");
    setPage(1);
    setSortColumn("totalWeight");
    setSortOrder("desc");
    setSelectedCompany(null);
  };

  const { data: statsData } = useSWR("/api/stats", fetcher);
  const { data: countries } = useSWR<string[]>("/api/countries", fetcher);

  // Pass search parameter to the API
  const { data: companiesResponse } = useSWR(
    `/api/companies?search=${encodeURIComponent(appliedSearch)}&role=${appliedRole}&country=${appliedCountry}&page=${page}&limit=${limit}&sort=${sortColumn}&order=${sortOrder}`,
    fetcher
  );

  const stats = statsData?.stats;
  const monthlyVolume = statsData?.monthlyVolume || [];
  const topCommodities = statsData?.topCommodities || [];
  const industryStats = [...(statsData?.industryStats || [])].sort((a: { weight: number }, b: { weight: number }) => Number(b.weight) - Number(a.weight));
  const industryTotalWeight = industryStats.reduce((sum: number, item: { weight: number }) => sum + item.weight, 0);

  const companies = companiesResponse?.data || [];
  const totalCompanies = companiesResponse?.total || 0;
  const totalPages = Math.ceil(totalCompanies / limit);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            Companies Overview
          </h1>

          {/* Stats Cards */}
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
                    {stats?.totalWeight ? `${(stats.totalWeight / 1000).toFixed(0)}k` : "-"}
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
                {topCommodities.map((item: { commodity: string; kg: number }, idx: number) => (
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
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Top 5 by total weight
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
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
                        label={({ cx, cy, midAngle = 0, innerRadius, outerRadius, percent = 0 }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          return percent > 0.05 ? (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          ) : null;
                        }}
                      >
                        {industryStats.map((entry: { sector: string; weight: number }, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "6px",
                        }}
                        itemStyle={{ color: '#e4e4e7' }}
                        formatter={(value: number | undefined) => [`${((value || 0) / 1000).toFixed(1)}k kg`, 'Weight']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Legend to ensure correct sorting order */}
                <div className="w-full sm:w-1/2 grid grid-cols-1 gap-y-2 max-h-64 overflow-y-auto">
                  {industryStats.map((item, index) => {
                    const percent = industryTotalWeight > 0 ? (item.weight / industryTotalWeight * 100).toFixed(0) : "0";
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
          </div >

          {/* Master-Detail: Company List + Detail Panel */}
          < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
            {/* Company List (Left/Main) */}
            < div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg shadow" >
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
                    {(appliedSearch || appliedRole !== "All" || appliedCountry !== "All" || sortColumn !== "totalWeight" || sortOrder !== "desc") && (
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
                        Company Name {sortColumn === "name" ? (sortOrder === "asc" ? "▲" : "▼") : <span className="text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>}
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
                        Shipments {sortColumn === "totalShipments" ? (sortOrder === "asc" ? "▲" : "▼") : <span className="text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>}
                      </th>
                      <th
                        className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 group"
                        onClick={() => handleSort("totalWeight")}
                      >
                        Total Weight {sortColumn === "totalWeight" ? (sortOrder === "asc" ? "▲" : "▼") : <span className="text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>}
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
                  Showing {companies.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalCompanies)} of {totalCompanies.toLocaleString()} companies
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
            </div >

            {/* Company Detail Panel (Right) */}
            < div className="bg-white dark:bg-zinc-900 rounded-lg shadow" >
              <CompanyDetail company={companies.find((c: Company) => c.name === selectedCompany) || null} />
            </div >
          </div >
        </div >
      </div >
    </>
  );
}
