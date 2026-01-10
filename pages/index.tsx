import { useState } from "react";
import useSWR from "swr";
import { Shipment } from "@/types/shipment";
import Navigation from "@/components/Navigation";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // What user types
  const [searchQuery, setSearchQuery] = useState(""); // What API uses
  const [startDateInput, setStartDateInput] = useState<Date | null>(null);
  const [startDateQuery, setStartDateQuery] = useState("");
  const [endDateInput, setEndDateInput] = useState<Date | null>(null);
  const [endDateQuery, setEndDateQuery] = useState("");
  const [minWeightInput, setMinWeightInput] = useState("");
  const [minWeightQuery, setMinWeightQuery] = useState("");
  const [weightOperator, setWeightOperator] = useState(">=");
  const [weightOperatorQuery, setWeightOperatorQuery] = useState(">=");
  const [showWeightOperator, setShowWeightOperator] = useState(false);
  const [sortColumn, setSortColumn] = useState("shipment_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const limit = 100;

  const { data: response, error, isLoading } = useSWR<{ data: Shipment[]; total: number }>(
    `/api/shipments?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&startDate=${startDateQuery}&endDate=${endDateQuery}&minWeight=${minWeightQuery}&weightOperator=${encodeURIComponent(weightOperatorQuery)}&sort=${sortColumn}&order=${sortOrder}`,
    fetcher
  );

  const shipments = response?.data;
  const total = response?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = () => {
    setSearchQuery(searchInput);

    // Format dates manually to avoid timezone shifting (toISOString uses UTC)
    // We want the literal date selected by the user in their local time.
    const formatDate = (date: Date | null) => {
      if (!date) return "";
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    };

    setStartDateQuery(formatDate(startDateInput));
    setEndDateQuery(formatDate(endDateInput));
    setMinWeightQuery(minWeightInput);
    setWeightOperatorQuery(weightOperator);
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc"); // Default to desc for new columns
    }
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setStartDateInput(null);
    setStartDateQuery("");
    setEndDateInput(null);
    setEndDateQuery("");
    setMinWeightInput("");
    setMinWeightQuery("");
    setWeightOperator(">=");
    setWeightOperatorQuery(">=");
    setShowWeightOperator(false);
    setSortColumn("shipment_date");
    setSortOrder("desc");
    setPage(1);
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-zinc-600 dark:text-zinc-400">Loading shipments...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Shipments
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Total shipments: {response?.total.toLocaleString() ?? 0}
          </p>

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
                {(searchQuery || startDateQuery || endDateQuery || minWeightQuery || weightOperatorQuery !== ">=" || sortColumn !== "shipment_date" || sortOrder !== "desc") && (
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

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    {[
                      { key: 'id', label: 'ID' },
                      { key: 'importer_name', label: 'Importer' },
                      { key: 'importer_country', label: 'Country' },
                      { key: 'exporter_name', label: 'Exporter' },
                      { key: 'shipment_date', label: 'Date' },
                      { key: 'commodity_name', label: 'Commodity' },
                      { key: 'weight_metric_tonnes', label: 'Weight (MT)' },
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
                    <tr key={shipment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
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
            {response && (
              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total.toLocaleString()} shipments
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
