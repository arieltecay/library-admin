import api from "../client";
import type { CashMovementItem, CashMovementListResult, CashMovementAggregated, ListCashMovementsParams } from "./types";

export async function listCashMovements(params?: ListCashMovementsParams): Promise<CashMovementListResult> {
  const { data } = await api.get("/cash-movements", { params });
  return data;
}

export async function getCashMovementsByShift(cashShiftId: string): Promise<CashMovementItem[]> {
  const { data } = await api.get(`/cash-shifts/${cashShiftId}/movements`);
  return data;
}

export async function getCashMovementsAggregated(cashShiftId: string): Promise<CashMovementAggregated> {
  const { data } = await api.get(`/cash-shifts/${cashShiftId}/movements/aggregated`);
  return data;
}

export async function deleteCashMovement(id: string): Promise<void> {
  await api.delete(`/cash-movements/${id}`);
}
export type * from "./types";
