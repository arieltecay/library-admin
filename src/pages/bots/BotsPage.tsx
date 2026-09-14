import { useEffect, useState } from "react";
import { listSchoolBots, setSchoolBot, type SchoolBot } from "../../api/bot";

export default function BotsPage() {
  const [bots, setBots] = useState<SchoolBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: "success" | "error" } | null>(null);

  const showToast = (message: string, kind: "success" | "error" = "success") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const items = await listSchoolBots();
      setBots(items);
    } catch {
      showToast("Error al cargar los negocios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleToggle = async (schoolId: string, name: string, nextEnabled: boolean) => {
    setUpdatingId(schoolId);
    try {
      const updated = await setSchoolBot(schoolId, nextEnabled);
      setBots(current => current.map(b => (b.schoolId === schoolId ? updated : b)));
      showToast(
        nextEnabled ? `Bot activado para ${name}` : `Bot desactivado para ${name}`
      );
    } catch {
      showToast("Error al actualizar el bot", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-white border border-neutral-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl pb-24 relative">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-md ${
          toast.kind === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Bots de ventas</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Add-on por negocio: habilitá el asistente de pedidos por WhatsApp para cada cliente.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-6 py-3 font-medium">Negocio</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">Estado</th>
              <th className="px-6 py-3 font-medium">Link del asistente</th>
              <th className="px-6 py-3 font-medium text-right">Add-on</th>
            </tr>
          </thead>
          <tbody>
            {bots.map(bot => (
              <tr key={bot.schoolId} className="border-b border-neutral-100 last:border-0">
                <td className="px-6 py-4 font-medium text-neutral-900">
                  {bot.name}
                  {!bot.active && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold uppercase">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-neutral-600">{bot.slug}</td>
                <td className="px-6 py-4">
                  {bot.botEnabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Desactivado
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-neutral-500 max-w-48 truncate text-xs" title={bot.botLink || undefined}>
                  {bot.botLink || "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    disabled={updatingId === bot.schoolId}
                    onClick={() => void handleToggle(bot.schoolId, bot.name, !bot.botEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      bot.botEnabled ? "bg-blue-600" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        bot.botEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
            {bots.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                  No hay negocios creados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-400 mt-3">
        Al habilitar el add-on se genera la clave del bot automáticamente. El dueño del negocio configura saludo y WhatsApp desde su panel.
      </p>
    </div>
  );
}
