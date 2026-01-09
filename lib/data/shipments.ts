import path from "path";
import { DuckDBInstance } from "@duckdb/node-api";
import { Shipment } from "@/types/shipment";
import { Company } from "@/types/company";

let instance: DuckDBInstance | null = null;
let tableInitialized = false;

async function getInstance(): Promise<DuckDBInstance> {
  if (!instance) {
    instance = await DuckDBInstance.create(":memory:");
  }
  return instance;
}

/**
 * Loads shipment data with pagination.
 */
export async function loadShipments(options?: {
  limit?: number;
  offset?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  minWeight?: number;
}): Promise<{ data: Shipment[]; total: number }> {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;
  const search = options?.search?.trim() ?? "";
  const startDate = options?.startDate?.trim() ?? "";
  const endDate = options?.endDate?.trim() ?? "";
  const minWeight = options?.minWeight;

  let whereClause = "";
  const conditions: string[] = [];

  if (search) {
    conditions.push(`(
      importer_name ILIKE '%${search}%' 
      OR exporter_name ILIKE '%${search}%' 
      OR commodity_name ILIKE '%${search}%'
    )`);
  }

  if (startDate) {
    conditions.push(`shipment_date >= '${startDate}'`);
  }

  if (endDate) {
    conditions.push(`shipment_date <= '${endDate}'`);
  }

  if (minWeight !== undefined && minWeight !== null) {
    conditions.push(`weight_metric_tonnes >= ${minWeight}`);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  const countResult = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM shipments ${whereClause}`
  );
  const total = countResult[0]?.total ?? 0;

  const data = await query<Shipment>(`
    SELECT * FROM shipments
    ${whereClause}
    ORDER BY shipment_date DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return { data, total };
}

/**
 * TODO: Implement this function using SQL.
 *
 * Transform shipment data into company-level aggregates.
 * Your SQL should match the Company interface you define in types/company.ts
 */
export async function transformShipmentsToCompanies(): Promise<Company[]> {
  const sql = `
    WITH companies AS (
      SELECT 
        importer_name AS name,
        importer_country AS country,
        importer_website AS website,
        COUNT(*) AS shipment_count,
        SUM(weight_metric_tonnes) AS total_weight,
        'Importer' AS type
      FROM shipments
      GROUP BY importer_name, importer_country, importer_website

      UNION ALL

      SELECT 
        exporter_name AS name,
        exporter_country AS country,
        exporter_website AS website,
        COUNT(*) AS shipment_count,
        SUM(weight_metric_tonnes) AS total_weight,
        'Exporter' AS type
      FROM shipments
      GROUP BY exporter_name, exporter_country, exporter_website
    )
    SELECT 
      name,
      FIRST(country) as country,
      FIRST(website) as website,
      CAST(SUM(shipment_count) AS INTEGER) AS totalShipments,
      CAST(SUM(total_weight) AS DOUBLE) AS totalWeight,
      CASE 
        WHEN COUNT(DISTINCT type) > 1 THEN 'Both'
        ELSE FIRST(type)
      END AS role
    FROM companies
    GROUP BY name
    ORDER BY totalWeight DESC
  `;

  return query<Company>(sql);
}

/**
 * Initializes the `shipments` table from JSON data.
 * This is called automatically before queries, so you can simply write:
 *
 * ```sql
 * SELECT * FROM shipments
 * ```
 */
async function ensureTableInitialized(): Promise<void> {
  if (tableInitialized) return;

  const db = await getInstance();
  const connection = await db.connect();
  const filePath = path.join(process.cwd(), "data", "shipments.json");

  await connection.run(`
    CREATE TABLE IF NOT EXISTS shipments AS
    SELECT * FROM read_json_auto('${filePath}')
  `);

  connection.closeSync();
  tableInitialized = true;
}

/**
 * Execute a SQL query and return the results as an array of objects.
 * The `shipments` table is automatically available — no need for read_json_auto.
 *
 * Example usage:
 * ```ts
 * const results = await query<{ name: string; total: number }>(`
 *   SELECT importer_name as name, COUNT(*) as total
 *   FROM shipments
 *   GROUP BY importer_name
 * `);
 * ```
 */
export async function query<T>(sql: string): Promise<T[]> {
  await ensureTableInitialized();

  const db = await getInstance();
  const connection = await db.connect();

  const reader = await connection.runAndReadAll(sql);
  const rows = reader.getRowObjectsJson();
  connection.closeSync();

  return rows as unknown as T[];
}
