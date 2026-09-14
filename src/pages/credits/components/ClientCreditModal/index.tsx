import { useEffect, useState } from 'react';
import Modal from '../../../../components/Modal';
import { PrintButton } from '../../../../components/PrintButton';
import { getClientCredit, type CreditMovementItem } from '../../../../api/credits';
import {
  formatDate,
  formatMoney,
  getMovementLabel,
  openPrintWindow,
  renderMovementTicketHtml,
  renderStatementHtml,
} from '../../utils/printTicket';
import type { ClientCreditModalProps } from './types';

export const ClientCreditModal = ({ isOpen, client, onClose }: ClientCreditModalProps) => {
  const [movements, setMovements] = useState<CreditMovementItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    getClientCredit(client.client.id)
      .then((result) => {
        if (!cancelled) setMovements(result.movements);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el detalle de la cuenta.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, client.client.id]);

  const handlePrintStatement = () => {
    openPrintWindow(
      `Estado de cuenta - ${client.client.fullName}`,
      renderStatementHtml(
        { fullName: client.client.fullName, dni: client.client.dni, balance: client.balance },
        movements
      )
    );
  };

  const handlePrintMovement = (movement: CreditMovementItem) => {
    openPrintWindow(
      `Comprobante - ${client.client.fullName}`,
      renderMovementTicketHtml(movement, { fullName: client.client.fullName, dni: client.client.dni })
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de cuenta corriente"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <PrintButton
            onClick={handlePrintStatement}
            title="Imprimir estado de cuenta"
          />
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-neutral-900">{client.client.fullName}</p>
          <p className="text-xs text-neutral-400">DNI {client.client.dni || '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Saldo actual</p>
          <p className={`text-xl font-bold ${client.balance > 0 ? 'text-red-600' : 'text-neutral-700'}`}>
            {formatMoney(client.balance)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-neutral-100 rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm">
          {error}
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-8 text-neutral-400 text-sm">Sin movimientos registrados</div>
      ) : (
        <div className="space-y-2">
          {movements.map((mov) => {
            const expanded = expandedId === mov.id;
            return (
              <div
                key={mov.id}
                className={`rounded-lg border transition-colors ${
                  expanded ? 'border-blue-200 bg-blue-50/40' : 'border-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3 py-2.5 px-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      mov.type === 'payment' ? 'bg-green-400' : 'bg-blue-400'
                    }`}
                  />
                  <button
                    onClick={() => setExpandedId(expanded ? null : mov.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-medium text-neutral-800">{getMovementLabel(mov)}</p>
                    <p className="text-xs text-neutral-500">{formatDate(mov.createdAt)}</p>
                  </button>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-sm font-semibold ${mov.type === 'payment' ? 'text-green-600' : 'text-neutral-700'}`}>
                      {mov.type === 'payment' ? '+' : '-'}{formatMoney(mov.amount)}
                    </span>
                    <p className="text-xs text-neutral-400">Saldo: {formatMoney(mov.balanceAfter)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <PrintButton
                      onClick={() => handlePrintMovement(mov)}
                      title="Imprimir comprobante"
                    />
                    <button
                      onClick={() => setExpandedId(expanded ? null : mov.id)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                      title={expanded ? 'Ocultar detalle' : 'Ver detalle'}
                    >
                      <span className="material-icons text-base">
                        {expanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {expanded && mov.sale && (
                  <div className="px-6 pb-4 pt-1 border-t border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                        Comprobante #{String(mov.sale.number).padStart(4, '0')}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDate(mov.sale.createdAt)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {mov.sale.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700">
                            {item.quantity} x {item.name}
                          </span>
                          <span className="text-neutral-600">{formatMoney(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-neutral-200 mt-2 pt-2">
                      <span className="text-sm font-semibold text-neutral-800">Total</span>
                      <span className="text-sm font-bold text-neutral-900">
                        {formatMoney(mov.sale.total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
