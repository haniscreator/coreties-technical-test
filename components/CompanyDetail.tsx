import useSWR from "swr";
import { Company } from "@/types/company";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CompanyDetailProps {
  company: Company | null;
}

export default function CompanyDetail({ company }: CompanyDetailProps) {
  const { data: details, isLoading } = useSWR(
    company ? `/api/companies/${encodeURIComponent(company.name)}` : null,
    fetcher
  );

  if (!company) {
    return (
      <div className="p-6 flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
        <p>Select a company to view details</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        {company.name}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        {company.country}
      </p>
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 block"
        >
          {company.website}
        </a>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {company.totalShipments.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Shipments</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {(company.totalWeight / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">kg Total</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading details...</div>
      ) : (
        <>
          {/* Top Trading Partners */}
          {details?.topTradingPartners && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
                Top Trading Partners
              </h3>
              <div className="space-y-2">
                {details.topTradingPartners.map((partner: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="text-zinc-900 dark:text-zinc-50">
                        {partner.name}
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                        {partner.country}
                      </span>
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {partner.shipments}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Commodities */}
          {details?.topCommodities && (
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
                Top Commodities
              </h3>
              <div className="space-y-2">
                {details.topCommodities.map((commodity: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-zinc-900 dark:text-zinc-50">
                      {commodity.name}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {(commodity.weight / 1000).toFixed(1)}k kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Role: {company.role}
        </p>
      </div>
    </div>
  );
}
