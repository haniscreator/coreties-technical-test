import { useState } from "react";
import Navigation from "@/components/Navigation";
import CompanyDetail from "@/components/CompanyDetail";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Data fetching hooks
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [country, setCountry] = useState("All");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRole, setAppliedRole] = useState("All");
  const [appliedCountry, setAppliedCountry] = useState("All");

  const handleSearch = () => {
    setAppliedSearch(search);
    setAppliedRole(role);
    setAppliedCountry(country);
    setSelectedCompany(null);
  };

  const handleReset = () => {
    setSearch("");
    setRole("All");
    setCountry("All");
    setAppliedSearch("");
    setAppliedRole("All");
    setAppliedCountry("All");
    setSelectedCompany(null);
  };

  const { data: statsData } = useSWR("/api/stats", fetcher);
  const { data: countries } = useSWR<string[]>("/api/countries", fetcher);

  // Pass search parameter to the API
  const { data: companiesData } = useSWR(
    `/api/companies?search=${encodeURIComponent(appliedSearch)}&role=${appliedRole}&country=${appliedCountry}`,
    fetcher
  );

  const stats = statsData?.stats;
  const monthlyVolume = statsData?.monthlyVolume || [];
  const topCommodities = statsData?.topCommodities || [];
  const companies = companiesData || [];

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
              <div className="grid grid-cols-2 gap-4">
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
                {topCommodities.map((item: any, idx: number) => (
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

          {/* Monthly KG Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-8">
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

          {/* Master-Detail: Company List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company List (Left/Main) */}
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
                    {(appliedSearch || appliedRole !== "All" || appliedCountry !== "All") && (
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
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Company Name
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Country
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Role
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Shipments
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-3">
                        Total Weight
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company: any, idx: number) => (
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
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Showing all companies
                </p>
              </div>
            </div>

            {/* Company Detail Panel (Right) */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
              <CompanyDetail company={companies.find((c: any) => c.name === selectedCompany) || null} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
