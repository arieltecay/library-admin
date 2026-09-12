import type { PrintButtonProps } from './types';

export const PrintButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = '',
  title = 'Ver ticket',
}: PrintButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors p-1.5 rounded disabled:opacity-50 ${className}`}
      title={title}
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <span className="material-icons text-[20px]">print</span>
      )}
    </button>
  );
};
