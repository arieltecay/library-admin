import { useEffect, useState } from "react";
import { getBotConfig, updateBotConfig, rotateBotKey, type BotConfig } from "../../api/bot";

interface BotSectionProps {
  onToast?: (message: string, kind?: "success" | "error") => void;
}

const DEFAULT_GREETING = "¡Hola! Soy el asistente de este negocio. ¿Qué estás buscando hoy?";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 px-4 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600 truncate"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

export function BotSection({ onToast }: BotSectionProps) {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internalToast, setInternalToast] = useState<{ message: string; kind: "success" | "error" } | null>(null);

  const showToast = (message: string, kind: "success" | "error" = "success") => {
    if (onToast) {
      onToast(message, kind);
      return;
    }
    setInternalToast({ message, kind });
    setTimeout(() => setInternalToast(null), 3000);
  };

  const [greeting, setGreeting] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [transferAlias, setTransferAlias] = useState("");
  const [transferCbu, setTransferCbu] = useState("");
  const [quickRepliesText, setQuickRepliesText] = useState("");

  const applyConfig = (data: BotConfig) => {
    setConfig(data);
    setGreeting(data.greeting || DEFAULT_GREETING);
    setWhatsappNumber(data.whatsappNumber);
    setTransferAlias(data.transferAlias ?? "");
    setTransferCbu(data.transferCbu ?? "");
    setQuickRepliesText(data.quickReplies.join("\n"));
  };

  const load = async () => {
    try {
      const data = await getBotConfig();
      applyConfig(data);
    } catch {
      showToast("Error al cargar la configuración del bot", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const parseQuickReplies = (): string[] =>
    quickRepliesText
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, 6);

  const digits = whatsappNumber.replace(/\D/g, "");
  // El bot arma el deeplink con wa.me: sin número válido el botón de WhatsApp
  // del cliente queda muerto. Validamos lo esencial antes de guardar.
  const whatsappError =
    digits.length === 0
      ? null
      : /^54\d{10,11}$/.test(digits)
        ? null
        : "Formato esperado: 549 + código de área + número (ej. 5493816346097). Debe ser el celular con WhatsApp del negocio.";

  const cbuDigits = transferCbu.replace(/\D/g, "");
  const cbuError =
    cbuDigits.length === 0
      ? null
      : cbuDigits.length === 22
        ? null
        : "El CVU/CBU debe tener 22 dígitos.";

  const handleToggle = async () => {
    if (!config) return;
    const nextEnabled = !config.enabled;
    setSaving(true);
    try {
      const data = await updateBotConfig({ enabled: nextEnabled });
      applyConfig(data);
      showToast(nextEnabled ? "Bot activado" : "Bot desactivado");
    } catch {
      showToast("Error al actualizar el bot", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (whatsappError || cbuError) {
      showToast(whatsappError || cbuError!, "error");
      return;
    }
    setSaving(true);
    try {
      const data = await updateBotConfig({
        greeting,
        whatsappNumber,
        transferAlias,
        transferCbu,
        quickReplies: parseQuickReplies(),
      });
      applyConfig(data);
      showToast("Configuración del bot guardada");
    } catch {
      showToast("Error al guardar la configuración del bot", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRotate = async () => {
    if (!window.confirm("Rotar la clave invalida el link actual. ¿Continuar?")) return;
    setSaving(true);
    try {
      const data = await rotateBotKey();
      applyConfig(data);
      showToast("Clave rotada — actualizá el link donde lo compartas");
    } catch {
      showToast("Error al rotar la clave", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-40 bg-neutral-200 rounded mb-4" />
        <div className="h-32 bg-neutral-100 rounded" />
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-icons text-blue-600">smart_toy</span>
          <h2 className="text-lg font-semibold text-neutral-900">Bot de ventas</h2>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config?.enabled ? "bg-blue-600" : "bg-neutral-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              config?.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {config?.enabled ? (
        <div className="space-y-6">
          <CopyField label="Link del asistente (compartilo en WhatsApp)" value={config.botLink} />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Saludo inicial</label>
            <textarea
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Sugerencias rápidas (una por línea, máx. 6)
            </label>
            <textarea
              value={quickRepliesText}
              onChange={e => setQuickRepliesText(e.target.value)}
              rows={3}
              placeholder={"¿Qué cuadernos tenés?\nLo más vendido"}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Número de WhatsApp del negocio (con código de país, solo dígitos)
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="549112345678"
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
            <p className={`mt-1 text-xs ${whatsappError ? "text-red-600" : "text-neutral-500"}`}>
              {whatsappError ?? "Formato: 549 + código de área + número. Sin +, espacios ni guiones. Debe ser un celular con WhatsApp activo."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Alias para transferencias
              </label>
              <input
                type="text"
                value={transferAlias}
                onChange={e => setTransferAlias(e.target.value)}
                placeholder="negocio.tienda"
                className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
              <p className="mt-1 text-xs text-neutral-500">
                El bot se lo comparte al cliente cuando elige pagar por transferencia.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                CVU/CBU para transferencias
              </label>
              <input
                type="text"
                value={transferCbu}
                onChange={e => setTransferCbu(e.target.value)}
                placeholder="0123456789012345678901"
                className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
              <p className={`mt-1 text-xs ${cbuError ? "text-red-600" : "text-neutral-500"}`}>
                {cbuError ?? "22 dígitos. Opcional si ya cargaste el alias."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={handleRotate}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Rotar clave
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Activá el bot para que tus clientes puedan pedir por chat desde un link de WhatsApp.
          Al activarlo se genera el link del asistente automáticamente.
        </p>
      )}
    </div>
  );
}
