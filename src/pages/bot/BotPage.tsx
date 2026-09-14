import { NavLink, Outlet } from "react-router";

const TABS = [
  { to: "", label: "Configuración", icon: "settings", end: true },
  { to: "messages", label: "Mensajes", icon: "chat" },
  { to: "training", label: "Entrenamiento", icon: "school" },
  { to: "orders", label: "Pedidos", icon: "shopping_bag" },
  { to: "metrics", label: "Métricas", icon: "insights" },
];

export const BotPage = () => (
  <div className="flex flex-col h-full min-h-0">
    <div className="px-6 pt-6 shrink-0">
      <h1 className="text-2xl font-bold text-neutral-900">Bot de ventas</h1>
      <p className="text-sm text-neutral-500 mt-1">
        Asistente de pedidos por WhatsApp para tus clientes. Activá el bot, entrenalo con el contexto de tu negocio y respondé pedidos listos para confirmar.
      </p>
    </div>

    <nav className="flex gap-1 px-6 mt-6 mb-4 border-b border-neutral-200 overflow-x-auto shrink-0">
      {TABS.map(tab => (
        <NavLink
          key={tab.label}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`
          }
        >
          <span className="material-icons text-base">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>

    {/* El tab activo recibe TODO el alto restante: MessagesPage lo usa como WhatsApp Web. */}
    <div className="flex-1 min-h-0 px-6 pb-6">
      <Outlet />
    </div>
  </div>
);

export default BotPage;
