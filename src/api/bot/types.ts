export interface BotStatusMessages {
  confirmed: string;
  paid: string;
  ready: string;
}

export interface BotConfig {
  enabled: boolean;
  greeting: string;
  quickReplies: string[];
  whatsappNumber: string;
  transferAlias: string;
  transferCbu: string;
  botLink: string;
  businessType: string;
  businessDescription: string;
  offTopics: string[];
  offTopicReply: string;
  statusMessages: BotStatusMessages;
}

export interface UpdateBotConfigPayload {
  enabled?: boolean;
  greeting?: string;
  quickReplies?: string[];
  whatsappNumber?: string;
  transferAlias?: string;
  transferCbu?: string;
  businessType?: string;
  businessDescription?: string;
  offTopics?: string[];
  offTopicReply?: string;
  statusMessages?: Partial<BotStatusMessages>;
}

export interface SchoolBot {
  schoolId: string;
  name: string;
  slug: string;
  active: boolean;
  botEnabled: boolean;
  botLink: string;
}

export interface BotMetricsDaily {
  date: string;
  requests: number;
  costUsd: number;
  avgTtftMs: number;
}

export interface BotMetrics {
  days: number;
  requests: number;
  costUsd: number;
  promptTokens: number;
  cachedTokens: number;
  cacheRatioPct: number;
  completionTokens: number;
  avgTtftMs: number;
  avgLatencyMs: number;
  toolCalls: number;
  daily: BotMetricsDaily[];
}

export interface ConversationSummary {
  id: string;
  sessionId: string;
  status: "bot" | "human";
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ConversationDetail {
  id: string;
  sessionId: string;
  status: "bot" | "human";
  messages: Array<{ role: "user" | "assistant" | "human"; content: string; toolName?: string; createdAt: string }>;
  lastMessageAt: string;
}

export type BotOrderStatus = "active" | "confirmed" | "ready" | "paying" | "paid" | "cancelled";

export interface BotOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface BotOrder {
  id: string;
  publicCode?: string;
  number: number;
  status: BotOrderStatus;
  total: number;
  subtotal: number;
  discount: number;
  items: BotOrderItem[];
  createdAt: string;
  saleId?: string;
  saleNumber?: number;
  customerName?: string;
  customerPhone?: string;
  paymentIntent?: "cash" | "transfer" | null;
}

export interface PaidOrder {
  quote: BotOrder;
  sale: { id: string; number: number; total: number; items: BotOrderItem[] };
}
