import { useRef } from "react";
import Modal from "../../../components/Modal";
import type { BotOrder } from "../../../api/bot";
import { money } from "../../../lib/format";

interface BotOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: BotOrder | null;
}

const STATUS_LABEL: Record<string, string> = {
  active: "PENDIENTE",
  confirmed: "CONFIRMADO",
  ready: "LISTO PARA RETIRAR",
  paying: "COBRANDO",
  paid: "PAGADO",
  cancelled: "CANCELADO",
};

const TICKET_CSS = `
  @page { margin: 0; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.4; width: 76mm; padding: 4mm; }
  .ticket { width: 100%; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 4px 0; }
  .info-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10px; }
  .items-table { width: 100%; font-size: 10px; border-collapse: collapse; margin: 4px 0; }
  .items-table th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 2px; font-weight: bold; }
  .items-table td { padding: 2px 0; vertical-align: top; }
  .items-table .qty { text-align: right; width: 30px; }
  .items-table .price { text-align: right; width: 50px; }
  .items-table .subtotal { text-align: right; width: 55px; }
  .totals { margin-top: 4px; font-size: 10px; }
  .totals .row { display: flex; justify-content: space-between; margin: 2px 0; }
  .totals .total-row { font-weight: bold; font-size: 12px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
  .footer { margin-top: 8px; text-align: center; font-size: 9px; }
  @media print { .no-print { display: none !important; } body { padding: 0; } }
`;

export default function BotOrderDetailModal({ isOpen, onClose, order }: BotOrderDetailModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!ticketRef.current || !order) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const ticketHtml = ticketRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido ${order.publicCode ?? `#${order.number}`}</title>
          <meta charset="utf-8">
          <style>${TICKET_CSS}</style>
        </head>
        <body onload="window.print(); window.onafterprint = () => window.close();">
          ${ticketHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!order) return null;

  const code = order.publicCode ?? `#${order.number.toString().padStart(4, "0")}`;
  const isCancelled = order.status === "cancelled";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido ${code}`}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-icons text-[18px]">print</span>
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div ref={ticketRef} className="ticket font-mono text-[11px] text-neutral-900">
        <div className="center">
          <p className="bold" style={{ fontSize: "13px", letterSpacing: "1px" }}>PEDIDO DEL BOT</p>
          <p className="bold" style={{ fontSize: "16px", marginTop: "2px" }}>{code}</p>
          <p className="no-print" style={{ fontSize: "9px", color: "#666", marginTop: "2px" }}>
            Vista previa - Se imprime en ticketera 80mm
          </p>
        </div>

        <div className="divider" />

        <div className="info-row">
          <span>Fecha:</span>
          <span>{new Date(order.createdAt).toLocaleString("es-AR", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
          })}</span>
        </div>
        <div className="info-row">
          <span>Origen:</span>
          <span>Asistente de ventas</span>
        </div>
        <div className="info-row">
          <span>Estado:</span>
          <span className="bold">{STATUS_LABEL[order.status] ?? order.status}</span>
        </div>
        {order.customerName && (
          <div className="info-row">
            <span>Cliente:</span>
            <span className="bold">{order.customerName}</span>
          </div>
        )}
        {order.paymentIntent && (
          <div className="info-row">
            <span>Pago elegido:</span>
            <span>{order.paymentIntent === "cash" ? "Efectivo" : "Transferencia"}</span>
          </div>
        )}

        <div className="divider" />

        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: "55%" }}>Producto</th>
              <th className="qty">Cant</th>
              <th className="price">P.Unit</th>
              <th className="subtotal">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td className="qty">{item.quantity}</td>
                <td className="price">{money(item.unitPrice)}</td>
                <td className="subtotal">{money(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="divider" />

        <div className="totals">
          <div className="row">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="row" style={{ color: "#dc2626" }}>
              <span>Descuento</span>
              <span>-{money(order.discount)}</span>
            </div>
          )}
          <div className="row total-row">
            <span>TOTAL</span>
            <span>{money(order.total)}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="footer">
          {isCancelled ? (
            <p className="bold" style={{ color: "#dc2626" }}>PEDIDO CANCELADO</p>
          ) : (
            <p>El precio se confirma al validar el pedido con el negocio</p>
          )}
          <p>Conserve este comprobante</p>
        </div>
      </div>
    </Modal>
  );
}
