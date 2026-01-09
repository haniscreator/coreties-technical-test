import type { NextApiRequest, NextApiResponse } from "next";
import { loadShipments } from "@/lib/data/shipments";
import { Shipment } from "@/types/shipment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: Shipment[]; total: number }>
) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const search = (req.query.search as string) || "";
    const startDate = (req.query.startDate as string) || "";
    const endDate = (req.query.endDate as string) || "";
    const minWeight = req.query.minWeight ? Number(req.query.minWeight) : undefined;
    const sort = (req.query.sort as string) || "shipment_date";
    const order = (req.query.order as 'asc' | 'desc') || "desc";
    const offset = (page - 1) * limit;

    const result = await loadShipments({ limit, offset, search, startDate, endDate, minWeight, sort, order });
    res.status(200).json(result);
  } catch (error) {
    console.error("API Error loading shipments:", error);
    res.status(500).json({ data: [], total: 0 });
  }
}
