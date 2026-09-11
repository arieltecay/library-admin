import { useEffect, useState } from 'react';
import Modal from '../../../../components/Modal';
import { PrintButton } from '../../../../components/PrintButton';
import { getClientCredit, type CreditMovementItem } from '../../../../api/creditsService';
import type { ClientCreditModalProps } from './types';

const getMovementLabel = (movement: CreditMovementItem): string => {
  if (movement.type === 'debt') return 'Crédito otorgado';
  const note = movement.note?.toLowerCase() || '';
  if (note.includes('promesa')) return 'Promesa de pago';
  if (note.includes('parcial')) return 'Pago parcial';
  if (note.includes('total')) return 'Pago total';
  return 'Pago registrado';
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (amount: number): string => `$${amount.toFixed(2)}`;

export const ClientCreditModal = ({ isOpen, client, onClose }: ClientCreditModalProps) => {
  const [movements, setMovements] = useState<CreditMovementItem[]>([]);
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = movements
      .map(
        (mov) => `
          <div class="row">
            <span>${formatDate(mov.createdAt)} — ${getMovementLabel(mov)}</span>
            <span>${mov.type === 'payment' ? '+' : '-'}${formatMoney(mov.amount)}</span>
          </div>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Estado de cuenta - ${client.client.fullName}</title>
          <meta charset="utf-8">
          <style>
            @page { margin: 0; size: 80mm auto; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.4; width: 76mm; padding: 4mm; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10px; }
            .footer { margin-top: 8px; text-align: center; font-size: 9px; }
          </style>
        </head>
        <body onload="window.print(); window.onafterprint = () => window.close();">
          <div class="center bold">MODISTA</div>
          <div class="center">Estado de cuenta corriente</div>
          <div class="divider"></div>
          <div class="row"><span>Cliente:</span><span>${client.client.fullName}</span></div>
          <div class="row"><span>DNI:</span><span>${client.client.dni || '—'}</span></div>
          <div class="row"><span>Saldo actual:</span><span>${formatMoney(client.balance)}</span></div>
          <div class="divider"></div>
          ${rows || '<div class="center">Sin movimientos</div>'}
          <div class="divider"></div>
          <div class="footer">Conserve este comprobante</div>
        </body>
      </html>
    `);
    printWindow.document.close();
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
            onClick={handlePrint}
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
          {movements.map((mov) => (
            <div
              key={mov.id}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-neutral-100"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  mov.type === 'payment' ? 'bg-green-400' : 'bg-blue-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800">{getMovementLabel(mov)}</p>
                <p className="text-xs text-neutral-500">{formatDate(mov.createdAt)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-sm font-semibold ${mov.type === 'payment' ? 'text-green-600' : 'text-neutral-700'}`}>
                  {mov.type === 'payment' ? '+' : '-'}{formatMoney(mov.amount)}
                </span>
                <p className="text-xs text-neutral-400">Saldo: {formatMoney(mov.balanceAfter)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
