import { useState } from "react";
import { Company } from "@/types/company";
import Navigation from "@/components/Navigation";
import CompanyDetail from "@/components/companies/CompanyDetail";
import StatsCard from "@/components/companies/StatsCard";
import CommoditiesCard from "@/components/companies/CommoditiesCard";
import MonthsCard from "@/components/companies/MonthsCard";
import SectorsCard from "@/components/companies/SectorsCard";
import CompanyList from "@/components/companies/CompanyList";
import useSWR from "swr";

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

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
    `/api/companies?search=${encodeURIComponent(
      appliedSearch
    )}&role=${appliedRole}&country=${appliedCountry}&page=${page}&limit=${limit}&sort=${sortColumn}&order=${sortOrder}`,
    fetcher
  );

  const stats = statsData?.stats;
  const monthlyVolume = statsData?.monthlyVolume || [];
  const topCommodities = statsData?.topCommodities || [];
  const industryStats = [...(statsData?.industryStats || [])].sort(
    (a: { weight: number }, b: { weight: number }) =>
      Number(b.weight) - Number(a.weight)
  );
  const industryTotalWeight = industryStats.reduce(
    (sum: number, item: { weight: number }) => sum + item.weight,
    0
  );

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatsCard stats={stats} />
            <CommoditiesCard topCommodities={topCommodities} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MonthsCard monthlyVolume={monthlyVolume} />
            <SectorsCard
              industryStats={industryStats}
              industryTotalWeight={industryTotalWeight}
            />
          </div>

          {/* Master-Detail: Company List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CompanyList
              companies={companies}
              totalCompanies={totalCompanies}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              search={search}
              setSearch={setSearch}
              role={role}
              setRole={setRole}
              country={country}
              setCountry={setCountry}
              countries={countries}
              handleSearch={handleSearch}
              handleReset={handleReset}
              showReset={
                appliedSearch !== "" ||
                appliedRole !== "All" ||
                appliedCountry !== "All" ||
                sortColumn !== "totalWeight" ||
                sortOrder !== "desc"
              }
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              handleSort={handleSort}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
            />

            {/* Company Detail Panel (Right) */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
              <CompanyDetail
                company={
                  companies.find(
                    (c: Company) => c.name === selectedCompany
                  ) || null
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
