import api from "../client";
import type { BotConfig, BotMetrics, BotOrder, BotOrderStatus, ConversationDetail, ConversationSummary, PaidOrder, SchoolBot, UpdateBotConfigPayload } from "./types";

export const getBotConfig = async (): Promise<BotConfig> => {
  const { data } = await api.get<BotConfig>("/ai/admin/config");
  return data;
}

export const updateBotConfig = async (payload: UpdateBotConfigPayload): Promise<BotConfig> => {
  const { data } = await api.put<BotConfig>("/ai/admin/config", payload);
  return data;
}

export const rotateBotKey = async (): Promise<BotConfig> => {
  const { data } = await api.post<BotConfig>("/ai/admin/rotate-key");
  return data;
}

export const listSchoolBots = async (): Promise<SchoolBot[]> => {
  const { data } = await api.get<{ items: SchoolBot[] }>("/ai/superadmin/bots");
  return data.items;
}

export const setSchoolBot = async (schoolId: string, enabled: boolean): Promise<SchoolBot> => {
  const { data } = await api.put<SchoolBot>(`/ai/superadmin/bots/${schoolId}`, { enabled });
  return data;
}

export const getBotMetrics = async (days = 30): Promise<BotMetrics> => {
  const { data } = await api.get<BotMetrics>("/ai/admin/metrics", { params: { days } });
  return data;
}

// ── Bandeja de mensajes ─────────────────────────────────────────────────────

export const listConversations = async (params: { status?: "bot" | "human"; page?: number; limit?: number } = {}): Promise<{ items: ConversationSummary[]; total: number; page: number; limit: number }> => {
  const { data } = await api.get("/ai/admin/conversations", { params });
  return data;
}

export const getConversation = async (id: string): Promise<ConversationDetail> => {
  const { data } = await api.get(`/ai/admin/conversations/${id}`);
  return data;
}

export const pauseConversation = async (id: string): Promise<ConversationDetail> => {
  const { data } = await api.patch(`/ai/admin/conversations/${id}/pause`);
  return data;
}

export const resumeConversation = async (id: string): Promise<ConversationDetail> => {
  const { data } = await api.patch(`/ai/admin/conversations/${id}/resume`);
  return data;
}

export const replyConversation = async (id: string, content: string): Promise<{ ok: boolean }> => {
  const { data } = await api.post(`/ai/admin/conversations/${id}/reply`, { content });
  return data;
}

// ── Pedidos del bot ─────────────────────────────────────────────────────────

export const listBotOrders = async (params: { status?: BotOrderStatus; page?: number; limit?: number } = {}): Promise<{ items: BotOrder[]; total: number; page: number; limit: number; totalPages: number }> => {
  const { data } = await api.get("/ai/admin/orders", { params });
  return data;
}

export const cancelBotOrder = async (id: string): Promise<BotOrder> => {
  const { data } = await api.patch(`/ai/admin/orders/${id}/cancel`);
  return data;
}

export const setBotOrderStatus = async (id: string, status: "confirmed" | "ready"): Promise<BotOrder> => {
  const { data } = await api.patch(`/ai/admin/orders/${id}/status`, { status });
  return data;
}

export const payBotOrder = async (id: string, paymentMethod: "cash" | "transfer"): Promise<PaidOrder> => {
  const { data } = await api.post(`/ai/admin/orders/${id}/pay`, { paymentMethod });
  return data;
}

export type * from "./types";
