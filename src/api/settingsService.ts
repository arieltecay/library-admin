import api from "./client";

export interface Settings {
  id?: string;
  libraryName: string;
  currency: string;
  language: string;
  dateFormat: string;
  defaultClient: string;
  maxDiscountPerSeller: number;
  allowSaleWithoutStock: boolean;
  scanSound: boolean;
}

export async function getSettings(): Promise<Settings> {
  const { data } = await api.get("/settings");
  return data;
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const { data } = await api.put("/settings", settings);
  return data;
}
