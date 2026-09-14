import api from "../client";
import type { Settings } from "./types";

export async function getSettings(): Promise<Settings> {
  const { data } = await api.get("/settings");
  return data;
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const { data } = await api.put("/settings", settings);
  return data;
}

export type * from "./types";
