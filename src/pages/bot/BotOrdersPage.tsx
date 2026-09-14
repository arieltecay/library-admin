import { useCallback, useEffect, useState } from "react";
import {
  listBotOrders,
  cancelBotOrder,
  setBotOrderStatus,
  payBotOrder,
  type BotOrder,
  type BotOrderStatus,
} from "../../api/bot";
import BotOrderDetailModal from "./components/BotOrderDetailModal";
import Modal from "../../components/Modal";
import { money } from "../../lib/format";

const STATUS_LABEL: Record<BotOrderStatus, string> = {
  active: "Pendiente",
  confirmed: "Confirmado",
  ready: "Listo",
  paying: "Pago avisado",
  paid: "Pagado",
  cancelled: "Cancelado",
};

const STATUS_BADGE: Record<BotOrderStatus, string> = {
  active: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  paying: "bg-violet-100 text-violet-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-neutral-100 text-neutral-500",
};

const NEXT_STATUS: Partial<Record<BotOrderStatus, { value: "confirmed" | "ready"; label: string }>> = {
  active: { value: "confirmed", label: "Confirmar" },
  confirmed: { value: "ready", label: "Marcar listo" },
};

// confirmed/ready directos; 'paying' = el cliente avisó que pagó (verificar comprobante y cobrar)
const PAYABLE: BotOrderStatus[] = ["confirmed", "ready", "paying"];

function StatusBadge({ status }: { status: BotOrderStatus }) {
  return (
    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${STATUS_BADGE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function BotOrdersPage() {
  const [orders, setOrders] = useState<BotOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "confirmed" | "ready" | "paid" | "cancelled" | "all">("active");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [detail, setDetail] = useState<BotOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BotOrder | null>(null);
  const [cancelError, setCancelError] = useState(false);
  const [payTarget, setPayTarget] = useState<BotOrder | null>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "transfer">("cash");
  const [payError, setPayError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listBotOrders({
        ...(filter !== "all" ? { status: filter } : {}),
        limit: 50,
      });
      setOrders(result.items);
      setTotalCount(result.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (order: BotOrder, next: "confirmed" | "ready") => {
    setBusyId(order.id);
    try {
      await setBotOrderStatus(order.id, next);
      void load();
      if (detail?.id === order.id) setDetail({ ...order, status: next });
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget.id);
    try {
      await cancelBotOrder(cancelTarget.id);
      setCancelTarget(null);
      setCancelError(false);
      void load();
      if (detail?.id === cancelTarget.id) setDetail({ ...cancelTarget, status: "cancelled" });
    } catch {
      setCancelError(true);
    } finally {
      setBusyId(null);
    }
  };

  const handlePay = async () => {
    if (!payTarget) return;
    setBusyId(payTarget.id);
    setPayError(null);
    try {
      await payBotOrder(payTarget.id, payMethod);
      setPayTarget(null);
      void load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cobrar el pedido.";
      setPayError(message.includes("Confirmá") ? "Confirmá el pedido antes de cobrarlo." : "No se pudo cobrar el pedido. ¿Hay stock suficiente?");
    } finally {
      setBusyId(null);
    }
  };

  const pending = orders.filter(o => o.status !== "cancelled" && o.status !== "paid" && o.status !== "paying");
  const pendingTotal = pending.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Pedidos del bot</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Pedidos que tus clientes armaron con el asistente. Confirmá con el cliente, marcalos listos y cobrá desde el POS.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">En curso</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{pending.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Valor en curso</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{money(pendingTotal)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total histórico</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{totalCount}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {(["active", "confirmed", "paid", "ready", "cancelled", "all"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${filter === f ? "bg-white text-neutral-900 shadow-sm border border-neutral-200" : "text-neutral-500 hover:text-neutral-700"
              }`}
          >
            {f === "all" ? "Todos" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <p className="p-12 text-center text-sm text-neutral-400">
            {filter === "all"
              ? "No hay pedidos del bot todavía."
              : `No hay pedidos ${STATUS_LABEL[filter as BotOrderStatus].toLowerCase()}s todavía.`}
          </p>
        ) : (
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="text-xs uppercase text-neutral-500 bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Código</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Total</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Estado</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Fecha</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map(order => {
                const next = NEXT_STATUS[order.status];
                return (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-neutral-900">
                      {order.publicCode ?? `#${order.number}`}
                    </td>
                    <td className="px-6 py-4">
                      {order.customerName ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-700">{order.customerName}</span>
                          {order.paymentIntent && (
                            <span
                              className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded tracking-wider bg-violet-100 text-violet-700"
                              title={order.paymentIntent === "cash" ? "Cliente eligió efectivo" : "Cliente eligió transferencia"}
                            >
                              {order.paymentIntent === "cash" ? "EFVO" : "TRANSF"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs">Sin nombre</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold">{money(order.total)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {new Date(order.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetail(order)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Ver pedido
                        </button>
                        {next && (
                          <button
                            type="button"
                            onClick={() => void handleStatusChange(order, next.value)}
                            disabled={busyId === order.id}
                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {busyId === order.id ? "…" : next.label}
                          </button>
                        )}
                        {PAYABLE.includes(order.status) && (
                          <button
                            type="button"
                            onClick={() => { setPayError(null); setPayMethod(order.paymentIntent ?? "cash"); setPayTarget(order); }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Cobrar
                          </button>
                        )}
                        {order.status !== "cancelled" && order.status !== "paid" && (
                          <button
                            type="button"
                            onClick={() => { setCancelError(false); setCancelTarget(order); }}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <BotOrderDetailModal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        order={detail}
      />

      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancelar pedido"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setCancelTarget(null)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => void handleCancel()}
              disabled={busyId === cancelTarget?.id}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {busyId === cancelTarget?.id ? "Cancelando…" : "Sí, cancelar"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          ¿Cancelar el pedido <span className="font-mono font-semibold">{cancelTarget?.publicCode ?? `#${cancelTarget?.number}`}</span>?
          Esta acción no se puede deshacer.
        </p>
        {cancelError && (
          <p className="mt-2 text-sm text-red-600">No se pudo cancelar el pedido. Intentá de nuevo.</p>
        )}
      </Modal>
      <Modal
        isOpen={!!payTarget}
        onClose={() => setPayTarget(null)}
        title={`Cobrar ${payTarget?.publicCode ?? `#${payTarget?.number}`}`}
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setPayTarget(null)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => void handlePay()}
              disabled={busyId === payTarget?.id}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {busyId === payTarget?.id ? "Cobrando…" : "Cobrar pedido"}
            </button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600 mb-4">
          Total a cobrar: <span className="font-bold text-neutral-900">{money(payTarget?.total ?? 0)}</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["cash", "transfer"] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setPayMethod(m)}
              className={`relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors flex flex-col items-center gap-1.5 ${payMethod === m
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
            >
              {payTarget?.paymentIntent === m && (
                <span className="absolute top-1.5 right-1.5 text-[8px] font-bold uppercase bg-violet-100 text-violet-700 px-1 rounded">
                  Cliente
                </span>
              )}
              <span className="material-icons text-xl">{m === "cash" ? "payments" : "account_balance"}</span>
              {m === "cash" ? "Efectivo" : "Transferencia"}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-neutral-400 mt-3">
          Se registra la venta en Ventas, se descuenta el stock y el pedido queda en la caja del turno del bot.
        </p>
        {payError && <p className="mt-2 text-sm text-red-600">{payError}</p>}
      </Modal>
    </div>
  );
}
