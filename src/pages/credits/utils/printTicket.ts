import type { CreditMovementItem } from '../../../api/creditsService';

export const formatMoney = (amount: number): string => `$${amount.toFixed(2)}`;

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getMovementLabel = (movement: CreditMovementItem): string => {
  if (movement.type === 'debt') return 'Crédito otorgado';
  const note = movement.note?.toLowerCase() || '';
  if (note.includes('promesa')) return 'Promesa de pago';
  if (note.includes('parcial')) return 'Pago parcial';
  if (note.includes('total')) return 'Pago total';
  return 'Pago registrado';
};

export const openPrintWindow = (title: string, body: string): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          @page { margin: 0; size: 80mm auto; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.4; width: 76mm; padding: 4mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10px; }
          .item { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10px; }
          .footer { margin-top: 8px; text-align: center; font-size: 9px; }
        </style>
      </head>
      <body onload="window.print(); window.onafterprint = () => window.close();">
        ${body}
      </body>
    </html>
  `);
  printWindow.document.close();
};

const movementRowsHtml = (movements: CreditMovementItem[]): string =>
  movements
    .map(
      (mov) => `
        <div class="row">
          <span>${formatDate(mov.createdAt)} — ${getMovementLabel(mov)}</span>
          <span>${mov.type === 'payment' ? '+' : '-'}${formatMoney(mov.amount)}</span>
        </div>`
    )
    .join('');

const movementTicketBody = (
  movement: CreditMovementItem,
  clientName: string,
  clientDni?: string
): string => {
  const sale = movement.sale;
  const items = sale
    ? sale.items
        .map(
          (item) => `
          <div class="item">
            <span>${item.quantity} x ${item.name}</span>
            <span>${formatMoney(item.subtotal)}</span>
          </div>`
        )
        .join('')
    : '';

  return `
    <div class="center bold">MODISTA</div>
    <div class="center">${movement.type === 'debt' ? 'COMPROBANTE DE CRÉDITO' : 'COMPROBANTE DE PAGO'}</div>
    <div class="divider"></div>
    <div class="row"><span>Cliente:</span><span>${clientName}</span></div>
    ${clientDni ? `<div class="row"><span>DNI:</span><span>${clientDni}</span></div>` : ''}
    <div class="row"><span>Fecha:</span><span>${formatDate(movement.createdAt)}</span></div>
    <div class="divider"></div>
    ${sale ? `<div class="row"><span>Comprobante:</span><span>#${String(sale.number).padStart(4, '0')}</span></div>` : ''}
    ${items}
    ${items ? '<div class="divider"></div>' : ''}
    <div class="row bold"><span>TOTAL</span><span>${movement.type === 'payment' ? '+' : '-'}${formatMoney(movement.amount)}</span></div>
    <div class="row"><span>Saldo posterior</span><span>${formatMoney(movement.balanceAfter)}</span></div>
    <div class="divider"></div>
    <div class="footer">Conserve este comprobante</div>
  `;
};

export const renderStatementHtml = (
  client: { fullName: string; dni?: string; balance: number },
  movements: CreditMovementItem[]
): string => `
  <div class="center bold">MODISTA</div>
  <div class="center">Estado de cuenta corriente</div>
  <div class="divider"></div>
  <div class="row"><span>Cliente:</span><span>${client.fullName}</span></div>
  <div class="row"><span>DNI:</span><span>${client.dni || '—'}</span></div>
  <div class="row"><span>Saldo actual:</span><span>${formatMoney(client.balance)}</span></div>
  <div class="divider"></div>
  ${movementRowsHtml(movements) || '<div class="center">Sin movimientos</div>'}
  <div class="divider"></div>
  <div class="footer">Conserve este comprobante</div>
`;

export const renderMovementTicketHtml = (
  movement: CreditMovementItem,
  client: { fullName: string; dni?: string }
): string => movementTicketBody(movement, client.fullName, client.dni);
