import { useEffect } from "react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  primaryAction?: { label: string; icon?: string; onClick: () => void; loading?: boolean };
  secondaryAction?: { label: string; icon?: string; onClick: () => void };
  showBell?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  primaryAction,
  secondaryAction,
  showBell = false,
}: PageHeaderProps) {
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "/" && (e.target as HTMLElement | null)?.tagName !== "INPUT") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-page-search]')?.focus();
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  const today = new Date();
  const dateLabel = `Hoy, ${today.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`;

  return (
    <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {title && (
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
        )}
        {onSearchChange !== undefined && (
          <div className="relative">
            <span className="material-icons text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 text-base">search</span>
            <input
              data-page-search
              type="text"
              placeholder={searchPlaceholder ?? "Buscar..."}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-11 pr-8 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-sm focus:border-primary-500 focus:outline-none w-72"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded">
              /
            </kbd>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm text-neutral-600">{dateLabel}</span>
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-3.5 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center gap-2"
          >
            {secondaryAction.icon && <span className="material-icons text-base">{secondaryAction.icon}</span>}
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            disabled={primaryAction.loading}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            {primaryAction.icon && <span className="material-icons text-base">{primaryAction.icon}</span>}
            {primaryAction.label}
          </button>
        )}
        {showBell && <span className="material-icons text-neutral-500">notifications</span>}
      </div>
    </div>
  );
}
