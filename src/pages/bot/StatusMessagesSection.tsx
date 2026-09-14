import { useEffect, useState } from "react";
import { getBotConfig, updateBotConfig, type BotConfig, type BotStatusMessages } from "../../api/bot";

interface StatusMessagesSectionProps {
  onToast?: (message: string, kind?: "success" | "error") => void;
}

const DEFAULTS: BotStatusMessages = {
  confirmed: "¡Buenas noticias! Tomamos tu pedido. Te avisamos cuando esté listo.",
  paid: "¡Listo! Ya quedó registrado el pago de tu pedido.",
  ready: "¡Tu pedido ya está listo para retirar! Te esperamos.",
};

const STATUSES: Array<{
  key: keyof BotStatusMessages;
  label: string;
  hint: string;
  icon: string;
}> = [
  {
    key: "confirmed",
    label: "Pedido tomado",
    hint: "Se envía cuando marcás el pedido como confirmado en la bandeja.",
    icon: "receipt_long",
  },
  {
    key: "paid",
    label: "Pago confirmado",
    hint: "Se envía cuando cobrás el pedido.",
    icon: "payments",
  },
  {
    key: "ready",
    label: "Listo para entregar",
    hint: "Se envía cuando marcás el pedido como listo para retirar.",
    icon: "local_mall",
  },
];

export function StatusMessagesSection({ onToast }: StatusMessagesSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<BotStatusMessages>(DEFAULTS);
  const [internalToast, setInternalToast] = useState<{ message: string; kind: "success" | "error" } | null>(null);

  const showToast = (message: string, kind: "success" | "error" = "success") => {
    if (onToast) {
      onToast(message, kind);
      return;
    }
    setInternalToast({ message, kind });
    setTimeout(() => setInternalToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data: BotConfig = await getBotConfig();
        setMessages({
          confirmed: data.statusMessages?.confirmed || DEFAULTS.confirmed,
          paid: data.statusMessages?.paid || DEFAULTS.paid,
          ready: data.statusMessages?.ready || DEFAULTS.ready,
        });
      } catch {
        showToast("Error al cargar los mensajes de estado", "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBotConfig({ statusMessages: messages });
      showToast("Mensajes de estado guardados");
    } catch {
      showToast("Error al guardar los mensajes", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded mb-4" />
        <div className="h-24 bg-neutral-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm relative">
      {internalToast && (
        <div className={`absolute -top-3 left-6 z-10 px-4 py-1.5 rounded-full text-xs font-medium shadow-md ${
          internalToast.kind === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {internalToast.message}
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className="material-icons text-blue-600">notifications_active</span>
        <h2 className="text-lg font-semibold text-neutral-900">Mensajes automáticos de estado</h2>
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        Cuando cambiás el estado de un pedido desde la bandeja, el bot le avisa al cliente en su chat con estos mensajes.
      </p>

      <div className="space-y-5">
        {STATUSES.map(({ key, label, hint, icon }) => (
          <div key={key}>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1.5">
              <span className="material-icons text-base text-neutral-400">{icon}</span>
              {label}
            </label>
            <textarea
              value={messages[key]}
              onChange={e => setMessages(m => ({ ...m, [key]: e.target.value }))}
              rows={2}
              maxLength={280}
              placeholder={DEFAULTS[key]}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-neutral-500">{hint}</p>
              <p className="text-xs text-neutral-400">{messages[key].length}/280</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar mensajes"}
      </button>
    </div>
  );
}
