
import { query } from "./shipments";

/**
 * Get global stats for the dashboard.
 */
export async function getGlobalStats() {
  const stats = await query<{
    name: string;
    total: number;
  }>(`
      SELECT 'Importers' as name, COUNT(DISTINCT importer_name) as total FROM shipments
      UNION ALL
      SELECT 'Exporters' as name, COUNT(DISTINCT exporter_name) as total FROM shipments
  `);

  const totals = await query<{ total_shipments: number; total_weight: number }>(`
    SELECT CAST(COUNT(*) AS INTEGER) as total_shipments, CAST(SUM(weight_metric_tonnes) AS DOUBLE) as total_weight FROM shipments
  `);

  return {
    totalImporters: stats.find((s) => s.name === "Importers")?.total ?? 0,
    totalExporters: stats.find((s) => s.name === "Exporters")?.total ?? 0,
    totalShipments: totals[0]?.total_shipments ?? 0,
    totalWeight: totals[0]?.total_weight ?? 0,
  };
}

/**
 * Get top 5 commodities by weight.
 */
export async function getTopCommodities() {
  return query<{ commodity: string; kg: number }>(`
    SELECT commodity_name as commodity, CAST(SUM(weight_metric_tonnes) AS DOUBLE) as kg
    FROM shipments
    GROUP BY commodity_name
    ORDER BY kg DESC
    LIMIT 5
  `);
}

/**
 * Get monthly volume (kg).
 */
export async function getMonthlyVolume() {
  // DuckDB date formatting: strftime(date, '%b %Y') -> "May 2025"
  // We need to order by date, so we might need a subquery or strict grouping.
  return query<{ month: string; kg: number; sort_date: string }>(`
    SELECT 
      strftime(shipment_date, '%b %Y') as month,
      CAST(SUM(weight_metric_tonnes) AS DOUBLE) as kg,
      MIN(shipment_date) as sort_date
    FROM shipments
    GROUP BY month
    ORDER BY sort_date ASC
  `);
}


/**
 * Get industry stats (using actual industry_sector field)
 */
export async function getIndustryStats() {
  return query<{ sector: string; weight: number }>(`
    SELECT 
      industry_sector as sector,
      CAST(SUM(weight_metric_tonnes) AS DOUBLE) as weight
    FROM shipments
    WHERE industry_sector IS NOT NULL AND industry_sector != ''
    GROUP BY industry_sector
    ORDER BY weight DESC
  `);
}

/**
 * Get details for a specific company.
 */
export async function getCompanyDetails(companyName: string) {
  // We need to find if this company is primarily an importer or exporter or both to find partners.
  // However, simplest way is to look for where this company is a participant.

  // Top Commodities
  const commodities = await query<{ name: string; weight: number }>(`
        SELECT commodity_name as name, CAST(SUM(weight_metric_tonnes) AS DOUBLE) as weight
        FROM shipments
        WHERE importer_name = '${companyName.replace(/'/g, "''")}' OR exporter_name = '${companyName.replace(/'/g, "''")}'
        GROUP BY commodity_name
        ORDER BY weight DESC
        LIMIT 5
    `);

  // Top Trading Partners
  // If I am importer, my partners are exporters.
  // If I am exporter, my partners are importers.
  const partners = await query<{ name: string; country: string; shipments: number }>(`
        WITH partners AS (
            SELECT exporter_name as name, exporter_country as country, COUNT(*) as shipments
            FROM shipments
            WHERE importer_name = '${companyName.replace(/'/g, "''")}'
            GROUP BY exporter_name, exporter_country
            
            UNION ALL
            
            SELECT importer_name as name, importer_country as country, COUNT(*) as shipments
            FROM shipments
            WHERE exporter_name = '${companyName.replace(/'/g, "''")}'
            GROUP BY importer_name, importer_country
        )
        SELECT name, country, CAST(SUM(shipments) AS INTEGER) as shipments
        FROM partners
        GROUP BY name, country
        ORDER BY shipments DESC
        LIMIT 5
    `);

  return {
    topCommodities: commodities,
    topTradingPartners: partners
  };
}
