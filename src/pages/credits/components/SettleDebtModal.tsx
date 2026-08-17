import { useState } from "react";
import Modal from "../../../components/Modal";
import type { SettleDebtPayload } from "../../../api/creditsService";

interface SettleDebtModalProps {
  isOpen: boolean;
  clientName: string;
  currentDebt: number;
  onClose: () => void;
  onConfirm: (payload: SettleDebtPayload) => Promise<void>;
}

export default function SettleDebtModal({
  isOpen,
  clientName,
  currentDebt,
  onClose,
  onConfirm,
}: SettleDebtModalProps) {
  const [amount, setAmount] = useState<string>(currentDebt.toFixed(2));
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Ingresá un monto válido mayor a $0");
      return;
    }
    if (numAmount > currentDebt) {
      setError(`El monto no puede superar la deuda actual de $${currentDebt.toFixed(2)}`);
      return;
    }
    setLoading(true);
    try {
      await onConfirm({ amount: numAmount, method, note: note || undefined });
      onClose();
    } catch {
      setError("Error al procesar el pago. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar pago"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="settle-form"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Confirmar pago
          </button>
        </div>
      }
    >
      <form id="settle-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Resumen de deuda */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <span className="material-icons text-base">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Deuda actual</p>
            <p className="text-xl font-bold text-red-600">${currentDebt.toFixed(2)}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{clientName}</p>
          </div>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Monto a pagar</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={currentDebt}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-7 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
            />
          </div>
        </div>

        {/* Método */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Método de pago</label>
          <div className="flex gap-3">
            {(["cash", "transfer"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                  method === m
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">
                  {m === "cash" ? "payments" : "swap_horiz"}
                </span>
                {m === "cash" ? "Efectivo" : "Transferencia"}
              </button>
            ))}
          </div>
        </div>

        {/* Nota */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nota (opcional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ej: Pago parcial acordado"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
