import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { closeCashShift, getCashShiftDetail, type CashShiftDetail } from "../../../api/cashShifts";
import { money } from "../../../lib/format";interface CloseShiftModalProps {
  shiftId: string | null;
  sellerName?: string;
  expectedAmount?: number;
  onClose: () => void;
  onClosed: () => void;
}

export default function CloseShiftModal({ shiftId, sellerName, expectedAmount: propExpected, onClose, onClosed }: CloseShiftModalProps) {
  const [closingAmount, setClosingAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CashShiftDetail | null>(null);

  useEffect(() => {
    if (!shiftId) {
      setDetail(null);
      setClosingAmount("");
      setNote("");
      setError(null);
      return;
    }
    getCashShiftDetail(shiftId)
      .then(d => setDetail(d))
      .catch(() => setDetail(null));
  }, [shiftId]);

  const expectedAmount = detail?.shift?.expectedAmount ?? propExpected;
  const parsedAmount = Number(closingAmount);
  const diff = expectedAmount != null && !Number.isNaN(parsedAmount) ? parsedAmount - expectedAmount : null;

  const handleClose = async () => {
    if (!shiftId || Number.isNaN(parsedAmount)) return;
    setSaving(true);
    setError(null);
    try {
      const payload: { closingAmount: number; note?: string } = { closingAmount: parsedAmount };
      if (note.trim()) payload.note = note.trim();
      await closeCashShift(shiftId, payload);
      onClosed();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cerrar el turno.";
      setError(message.includes("motivo") ? "Hay diferencia con el esperado: agregá una nota explicando el motivo." : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!shiftId}
      onClose={onClose}
      title={`Cerrar turno${sellerName ? ` — ${sellerName}` : ""}`}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={() => void handleClose()}
            disabled={saving || closingAmount === "" || Number.isNaN(parsedAmount)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Cerrando…" : "Cerrar turno"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {expectedAmount != null && (
          <div className="bg-neutral-50 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-600">Esperado en caja</span>
            <span className="text-sm font-bold text-neutral-900">{money(expectedAmount)}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Monto contado en caja</label>
          <input
            type="number"
            inputMode="decimal"
            value={closingAmount}
            onChange={e => setClosingAmount(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {diff !== null && diff !== 0 && (
          <div className={`rounded-lg px-4 py-3 text-sm ${diff > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            Diferencia: <strong>{money(Math.abs(diff))}</strong> {diff > 0 ? "a favor" : "faltante"} — se requiere una nota.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Nota {diff !== null && diff !== 0 ? "(obligatoria por la diferencia)" : "(opcional)"}
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="Ej: faltante por pago con billete roto"
            className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
