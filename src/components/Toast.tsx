import { useEffect } from "react";
import type { ToastKind } from "../hooks/useToast";

interface ToastProps {
  kind: ToastKind;
  message: string;
  onClose: () => void;
}

const KIND_STYLES: Record<ToastKind, string> = {
  success: "bg-success-50 border-success-600 text-success-900",
  error: "bg-danger-50 border-danger-600 text-danger-900",
  warning: "bg-warning-50 border-warning-600 text-warning-900",
  info: "bg-primary-50 border-primary-600 text-primary-900",
};

function kindIcon(kind: ToastKind): string {
  switch (kind) {
    case "success":
      return "check_circle";
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "info":
      return "info";
  }
}

export function Toast({ kind, message, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg z-50 ${KIND_STYLES[kind]}`}
    >
      <span className="material-icons text-base">{kindIcon(kind)}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-current opacity-60 hover:opacity-100"
        aria-label="Cerrar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
