import { useState } from "react";
import useSWR from "swr";
import { Shipment } from "@/types/shipment";
import Navigation from "@/components/Navigation";
import ShipmentFilters from "@/components/home/ShipmentFilters";
import ShipmentList from "@/components/home/ShipmentList";

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

  const { data: response, error, isLoading } = useSWR<{
    data: Shipment[];
    total: number;
  }>(
    `/api/shipments?page=${page}&limit=${limit}&search=${encodeURIComponent(
      searchQuery
    )}&startDate=${startDateQuery}&endDate=${endDateQuery}&minWeight=${minWeightQuery}&weightOperator=${encodeURIComponent(
      weightOperatorQuery
    )}&sort=${sortColumn}&order=${sortOrder}`,
    fetcher
  );

  const shipments = response?.data;
  const total = response?.total ?? 0;

  const handleSearch = () => {
    setSearchQuery(searchInput);

    // Format dates manually to avoid timezone shifting (toISOString uses UTC)
    // We want the literal date selected by the user in their local time.
    const formatDate = (date: Date | null) => {
      if (!date) return "";
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().split("T")[0];
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
            <p className="text-zinc-600 dark:text-zinc-400">
              Loading shipments...
            </p>
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
            <p className="text-red-600 dark:text-red-400">
              Error: {error.message}
            </p>
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

          <ShipmentFilters
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            startDateInput={startDateInput}
            setStartDateInput={setStartDateInput}
            endDateInput={endDateInput}
            setEndDateInput={setEndDateInput}
            minWeightInput={minWeightInput}
            setMinWeightInput={setMinWeightInput}
            weightOperator={weightOperator}
            setWeightOperator={setWeightOperator}
            showWeightOperator={showWeightOperator}
            setShowWeightOperator={setShowWeightOperator}
            handleSearch={handleSearch}
            handleReset={handleReset}
            showReset={
              searchQuery !== "" ||
              startDateQuery !== "" ||
              endDateQuery !== "" ||
              minWeightQuery !== "" ||
              weightOperatorQuery !== ">=" ||
              sortColumn !== "shipment_date" ||
              sortOrder !== "desc"
            }
          />

          <ShipmentList
            shipments={shipments}
            total={total}
            page={page}
            limit={limit}
            setPage={setPage}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
        </div>
      </div>
    </>
  );
}
