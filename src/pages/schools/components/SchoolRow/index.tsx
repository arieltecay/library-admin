import type { SchoolRowProps } from './types';
import { SchoolSwitch } from '../SchoolSwitch';
import { useState } from 'react';

export function SchoolRow({ school, onToggle, onEdit, onDelete, togglingId }: SchoolRowProps) {
  return (
    <tr key={school.id} className="border-b border-neutral-100 hover:bg-neutral-50">
      <td className="px-3 py-3">
        <div className="font-medium text-neutral-900">{school.name}</div>
      </td>
      <td className="px-3 py-3">
        <span className="font-mono text-xs text-neutral-500">{school.code}</span>
      </td>
      <td className="px-3 py-3">
        <span className="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{school.slug}</span>
      </td>
      <td className="px-3 py-3">
        <PosLoginUrlCell slug={school.slug} />
      </td>
      <td className="px-3 py-3 text-neutral-500 text-sm">{school.address || '—'}</td>
      <td className="px-3 py-3 text-center">
        <SchoolSwitch
          active={school.active}
          onToggle={() => onToggle(school.id, !school.active)}
          disabled={!!togglingId}
          aria-label={`${school.active ? 'Desactivar' : 'Activar'} ${school.name}`}
        />
      </td>
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(school)}
            className="text-neutral-400 hover:text-primary-600 p-1 rounded-lg hover:bg-primary-50"
            aria-label={`Editar ${school.name}`}
            title="Editar"
          >
            <span className="material-icons text-sm">edit</span>
          </button>
          <button
            onClick={() => onDelete(school)}
            className="ml-1 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 p-1 rounded-lg"
            aria-label={`Eliminar ${school.name}`}
            title="Eliminar"
          >
            <span className="material-icons text-sm">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function PosLoginUrlCell({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = getPosLoginUrl(slug);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-neutral-600 truncate max-w-[200px]" title={url}>{url}</span>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
        aria-label="Copiar URL"
        title={copied ? '¡Copiado!' : 'Copiar URL'}
      >
        {copied ? (
          <span className="material-icons text-sm text-success-600">check</span>
        ) : (
          <span className="material-icons text-sm">content_copy</span>
        )}
      </button>
    </div>
  );
}

function getPosLoginUrl(slug: string): string {
  const base = import.meta.env.VITE_POS_BASE_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;
  if (!import.meta.env.VITE_POS_BASE_URL && import.meta.env.PROD) {
    console.warn('VITE_POS_BASE_URL not set in production, using fallback');
  }
  return `${base}/login?pos_app=${encodeURIComponent(slug)}`;
}