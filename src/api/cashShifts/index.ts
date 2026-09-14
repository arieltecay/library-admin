import api from "../client";
import type { CashShiftDetail, CashShiftItem, CashShiftListResult, CloseCashShiftPayload, DailySummary, ListCashShiftsParams } from "./types";

export const listCashShifts = async (params?: ListCashShiftsParams): Promise<CashShiftListResult> => {
  const { data } = await api.get("/cash-shifts", { params });
  return data;
};

export const getDailySummary = async (date?: string): Promise<DailySummary> => {
  const { data } = await api.get("/cash-shifts/summary/daily", { params: date ? { date } : {} });
  return data;
};

export const getCashShift = async (id: string): Promise<CashShiftItem> => {
  const { data } = await api.get(`/cash-shifts/${id}`);
  return data;
};

export const getCashShiftDetail = async (id: string): Promise<CashShiftDetail> => {
  const { data } = await api.get(`/cash-shifts/${id}/detail`);
  return data;
};

export const closeCashShift = async (id: string, payload: CloseCashShiftPayload): Promise<CashShiftDetail> => {
  const { data } = await api.post(`/cash-shifts/${id}/close`, payload);
  return data;
};
export type * from "./types";
