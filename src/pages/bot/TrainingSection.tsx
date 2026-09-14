import { useEffect, useState } from "react";
import { getBotConfig, updateBotConfig, type BotConfig } from "../../api/bot";

interface TrainingSectionProps {
  onToast?: (message: string, kind?: "success" | "error") => void;
}

const OFF_TOPIC_PLACEHOLDER = "Mmm, creo que eso no lo manejamos acá. ¿Te puedo ayudar con algo de nuestro catálogo?";

const BUSINESS_TYPES = [
  { value: "libreria", label: "Librería" },
  { value: "merceria", label: "Mercería" },
  { value: "kiosco", label: "Kiosco" },
  { value: "fotocopiadora", label: "Fotocopiadora" },
  { value: "almacen", label: "Almacén" },
  { value: "carniceria", label: "Carnicería" },
  { value: "verduleria", label: "Verdulería" },
  { value: "panaderia", label: "Panadería" },
  { value: "restaurante", label: "Restaurante / Comida" },
  { value: "cafeteria", label: "Cafetería" },
  { value: "farmacia", label: "Farmacia" },
  { value: "ropa", label: "Ropa / Indumentaria" },
  { value: "electronica", label: "Electrónica" },
  { value: "ferreteria", label: "Ferretería" },
  { value: "floreria", label: "Florería" },
  { value: "mascotas", label: "Mascotas" },
  { value: "otro", label: "Otro" },
];

/** Cómo vende el bot según el rubro: se muestra al dueño para que sepa qué esperar
 *  y cómo escribir la descripción para potenciar el flujo. */
const FLOW_BY_TYPE: Record<string, string> = {
  libreria: "El bot ofrece útiles y libros, toma el pedido por cantidad (ej: 3 cuadernos), pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  merceria: "El bot ofrece hilos, botones y telas por color/tipo, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  kiosco: "El bot ofrece golosinas, bebidas y cigarrillos del catálogo, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  fotocopiadora: "El bot cotiza fotocopias e impresiones (anillados, doble faz), toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  almacen: "El bot ofrece productos de almacén por marca/cantidad, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  carniceria: "El bot ofrece cortes y ofertas del día por peso aproximado, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  verduleria: "El bot ofrece frutas y verduras de estación por unidad/kilo, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  panaderia: "El bot ofrece pan, facturas y tortas del día, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  restaurante: "El bot ofrece platos y menús, toma el pedido (para retirar), pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  cafeteria: "El bot ofrece cafés, bebidas y pastelería, toma el pedido (para retirar), pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  farmacia: "El bot ofrece productos de mostrador (no recetas), toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  ropa: "El bot ofrece prendas por talle y color, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  electronica: "El bot ofrece productos del catálogo con precio y garantía, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  ferreteria: "El bot ofrece herramientas y materiales por unidad/caja, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  floreria: "El bot ofrece ramos y arreglos disponibles, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  mascotas: "El bot ofrece alimento y accesorios por marca/tamaño, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
  otro: "El bot ofrece los productos de tu catálogo, toma el pedido, pregunta nombre y forma de pago, y arma el mensaje de confirmación para tu WhatsApp.",
};

export function TrainingSection({ onToast }: TrainingSectionProps) {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessType, setBusinessType] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [offTopicsText, setOffTopicsText] = useState("");
  const [offTopicReply, setOffTopicReply] = useState("");

  const applyConfig = (data: BotConfig) => {
    setConfig(data);
    setBusinessType(data.businessType || "");
    setBusinessDescription(data.businessDescription || "");
    setOffTopicsText(data.offTopics.join("\n"));
    setOffTopicReply(data.offTopicReply || "");
  };

  const load = async () => {
    try {
      applyConfig(await getBotConfig());
    } catch {
      onToast?.("Error al cargar el entrenamiento del bot", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseOffTopics = (): string[] =>
    offTopicsText
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, 20);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateBotConfig({
        businessType: businessType.trim() || undefined,
        businessDescription: businessDescription.trim(),
        offTopics: parseOffTopics(),
        offTopicReply: offTopicReply.trim(),
      });
      applyConfig(data);
      onToast?.("Entrenamiento del bot guardado");
    } catch {
      onToast?.("Error al guardar el entrenamiento", "error");
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
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-blue-600">school</span>
          <h2 className="text-lg font-semibold text-neutral-900">Contexto del negocio</h2>
        </div>
        <p className="text-sm text-neutral-500 mb-6">
          El bot usa esta información para entender tu rubro. Todo lo que esté fuera de estos parámetros lo va a rechazar sin gastar respuestas.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Rubro del negocio</label>
            <select
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Seleccioná tu rubro…</option>
              {BUSINESS_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {businessType && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide mb-1.5">
                  Así vende tu bot en este rubro
                </p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Ofrece los productos de tu catálogo con precio y disponibilidad (en lista, uno por línea).</li>
                  <li>Cuando el cliente elige, arma el pedido al instante y le da el código.</li>
                  <li>Le pregunta el nombre y después la forma de pago.</li>
                  <li>Le muestra el botón verde de WhatsApp con el pedido completo y ordenado, listo para enviarte.</li>
                </ol>
                <p className="text-xs text-blue-700 mt-2.5 italic">{FLOW_BY_TYPE[businessType]}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Contale al bot qué hace tu negocio
            </label>
            <textarea
              value={businessDescription}
              onChange={e => setBusinessDescription(e.target.value)}
              rows={3}
              maxLength={600}
              placeholder="Somos una mercería de barrio. Vendemos hilos, botones, cierres, telas y hacemos fotocopias e impresiones en blanco y negro."
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              {businessDescription.length}/600 caracteres
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-red-500">block</span>
          <h2 className="text-lg font-semibold text-neutral-900">Temas que no atiende</h2>
        </div>
        <p className="text-sm text-neutral-500 mb-6">
          Si el cliente pregunta por alguno de estos temas, el bot lo rechaza <strong>al instante y sin gastar tokens</strong>. No busca en el catálogo ni ofrece alternativas.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Lista de temas bloqueados (uno por línea, máx. 20)
            </label>
            <textarea
              value={offTopicsText}
              onChange={e => setOffTopicsText(e.target.value)}
              rows={5}
              placeholder={"comida\npizza\nhamburguesa\nreparacion de celular"}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none font-mono text-[13px]"
            />
            {config && config.offTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {config.offTopics.map(t => (
                  <span key={t} className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Respuesta cuando bloquea un tema
            </label>
            <textarea
              value={offTopicReply}
              onChange={e => setOffTopicReply(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder={OFF_TOPIC_PLACEHOLDER}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Ejemplo:</strong> si vendés hilos y el cliente pide "pizza", el bot responde con el mensaje de arriba y no consulta el catálogo. Ahorra respuestas del bot y evita confusiones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar entrenamiento"}
          </button>
          <span className="text-[11px] text-neutral-400">
            Los cambios aplican a las conversaciones nuevas al instante.
          </span>
        </div>
      </div>
    </div>
  );
}
