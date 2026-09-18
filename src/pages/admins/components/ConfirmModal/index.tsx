import type { ConfirmModalProps, ConfirmModalVariant } from './types';
import Modal from '../../../../components/Modal';

const variantStyles: Record<ConfirmModalVariant, { icon: string; iconColor: string; confirmColor: string }> = {
  danger: { icon: 'warning', iconColor: 'text-red-500', confirmColor: 'bg-red-600 hover:bg-red-700' },
  warning: { icon: 'warning', iconColor: 'text-amber-500', confirmColor: 'bg-amber-600 hover:bg-amber-700' },
  info: { icon: 'info', iconColor: 'text-blue-500', confirmColor: 'bg-blue-600 hover:bg-blue-700' },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'danger',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}: ConfirmModalProps) {
  const { icon, iconColor, confirmColor } = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <span className={`material-icons ${iconColor} flex-shrink-0 mt-0.5`}>{icon}</span>
          <p className="text-neutral-700 text-base leading-relaxed flex-1">{message}</p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${confirmColor} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}