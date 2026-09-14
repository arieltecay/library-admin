import api from "../client";
import type { DashboardOverview, GetOverviewParams } from "./types";

export async function getOverview(params: GetOverviewParams = {}): Promise<DashboardOverview> {
  const { data } = await api.get("/dashboard/overview", { params });
  return data;
}
export type * from "./types";
