import { useState } from "react";
import Modal from "../../../components/Modal";
import { creditNoteSale } from "../../../api/sales";
import type { SaleRow } from "../../../api/types";
import { money } from "../../../lib/format";

interface CreditNoteModalProps {
  isOpen: boolean;
  sale: SaleRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    cash: "Efectivo",
    transfer: "Transferencia",
    credit: "Crédito",
  };
  return labels[method] || method;
}

function getPaymentMethodIcon(method: string) {
  const icons: Record<string, string> = {
    cash: "payments",
    transfer: "account_balance",
    credit: "credit_card",
  };
  return icons[method] || "payments";
}

export default function CreditNoteModal({
  isOpen,
  sale,
  onClose,
  onSuccess,
}: CreditNoteModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    setError("");
    setLoading(true);
    try {
      await creditNoteSale(sale.id, reason.trim() || undefined);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al emitir la nota de crédito. Intentá de nuevo.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!sale) return null;

  const isCredit = sale.paymentMethod === "credit";
  const isTransfer = sale.paymentMethod === "transfer";
  const isCash = sale.paymentMethod === "cash";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emitir Nota de Crédito"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="credit-note-form"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Emitir Nota de Crédito
          </button>
        </div>
      }
    >
      <form id="credit-note-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Resumen de la venta */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Venta original</p>
            <span className="font-bold text-neutral-900">#{sale.number.toString().padStart(4, "0")}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-neutral-500">Total</p>
              <p className="font-bold text-neutral-900">{money(sale.total)}</p>
            </div>
            <div>
              <p className="text-neutral-500">Método</p>
              <p className="font-medium text-neutral-700 flex items-center gap-1">
                <span className="material-icons text-[14px]">{getPaymentMethodIcon(sale.paymentMethod)}</span>
                {getPaymentMethodLabel(sale.paymentMethod)}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Cliente</p>
              <p className="font-medium text-neutral-700">{sale.client?.fullName || "Consumidor Final"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Fecha</p>
              <p className="font-medium text-neutral-700">{new Date(sale.createdAt).toLocaleString("es-AR")}</p>
            </div>
          </div>
        </div>

        {/* Qué ocurrirá */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
            <span className="material-icons text-[16px]">info</span>
            Se realizarán las siguientes acciones:
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center gap-1">
              <span className="material-icons text-[14px] text-blue-600">check_circle</span>
              La venta original quedará marcada como <strong>ANULADA</strong>
            </li>
            <li className="flex items-center gap-1">
              <span className="material-icons text-[14px] text-blue-600">check_circle</span>
              Se devolverá el <strong>stock</strong> de todos los productos
            </li>
            {isCredit && (
              <li className="flex items-center gap-1">
                <span className="material-icons text-[14px] text-blue-600">check_circle</span>
                Se revertirá el <strong>crédito del cliente</strong> (saldo disminuye)
              </li>
            )}
            {isCash && (
              <li className="flex items-center gap-1">
                <span className="material-icons text-[14px] text-blue-600">check_circle</span>
                El <strong>efectivo</strong> se descuenta del arqueo (la venta anulada deja de sumar)
              </li>
            )}
            {isTransfer && (
              <li className="flex items-center gap-1">
                <span className="material-icons text-[14px] text-blue-600">check_circle</span>
                <strong>Transferencia</strong>: solo se registra la NC y devuelve stock (caja intacta)
              </li>
            )}
            <li className="flex items-center gap-1">
              <span className="material-icons text-[14px] text-blue-600">check_circle</span>
              Se genera comprobante <strong>Nota de Crédito</strong> vinculado a la venta original
            </li>
          </ul>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Motivo (opcional)</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ej: Devolución por defecto, error en facturación, etc."
            maxLength={200}
            rows={3}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
          />
          <p className="text-xs text-neutral-500 mt-1 text-right">{reason.length}/200</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm">
            {error}
          </div>
        )}

        <p className="text-xs text-neutral-500 text-center">
          Esta acción no se puede deshacer. La venta original quedará anulada permanentemente.
        </p>
      </form>
    </Modal>
  );
}