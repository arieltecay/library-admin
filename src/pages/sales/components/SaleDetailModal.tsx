import { useRef } from "react";
import Modal from "../../../components/Modal";
import type { SaleRow } from "../../../api/types";
import { money } from "../../../lib/format";

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRow | null;
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function PaymentMethodLabel(method: string, type: string) {
  if (type === "return") return "Reintegro";
  if (type === "credit_note") return "Nota de Crédito";
  const labels: Record<string, string> = {
    cash: "Efectivo",
    transfer: "Transferencia",
    credit: "Crédito",
  };
  return labels[method] || method;
}

function PaymentMethodIcon(method: string, type: string) {
  if (type === "return") return "payments";
  if (type === "credit_note") return "receipt_long";
  const icons: Record<string, string> = {
    cash: "payments",
    transfer: "account_balance",
    credit: "credit_card",
  };
  return icons[method] || "payments";
}

export default function SaleDetailModal({ isOpen, onClose, sale }: SaleDetailModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!ticketRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const ticketHtml = ticketRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket #${sale?.number}</title>
          <meta charset="utf-8">
          <style>
            @page { margin: 0; size: 80mm auto; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.4; width: 76mm; padding: 4mm; }
            .ticket { width: 100%; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .header { margin-bottom: 4px; }
            .header h1 { font-size: 13px; margin-bottom: 2px; }
            .header p { font-size: 10px; margin: 1px 0; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 10px; }
            .items-table { width: 100%; font-size: 10px; border-collapse: collapse; margin: 4px 0; }
            .items-table th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 2px; font-weight: bold; }
            .items-table td { padding: 2px 0; vertical-align: top; }
            .items-table .qty { text-align: right; width: 30px; }
            .items-table .price { text-align: right; width: 50px; }
            .items-table .subtotal { text-align: right; width: 55px; }
            .item-name { display: block; }
            .item-detail { font-size: 9px; color: #333; }
            .totals { margin-top: 4px; font-size: 10px; }
            .totals .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .totals .total-row { font-weight: bold; font-size: 12px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
            .payment-info { margin-top: 4px; font-size: 10px; }
            .payment-info .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .footer { margin-top: 8px; text-align: center; font-size: 9px; }
            .void-badge { text-align: center; font-weight: bold; font-size: 12px; margin: 4px 0; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.onafterprint = () => window.close();">
          ${ticketHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!sale) return null;

  const isReturn = sale.type === "return";
  const isCreditNote = sale.type === "credit_note";
  const isVoided = sale.voided;
  const numStr = `#${sale.number.toString().padStart(4, "0")}${isReturn ? "R" : isCreditNote ? "NC" : ""}`;

  const getTitle = () => {
    if (isCreditNote) return "Detalle de Nota de Crédito";
    if (isReturn) return "Detalle de Devolución";
    return "Detalle de Venta";
  };

  const getComprobanteLabel = () => {
    if (isCreditNote) return "NOTA DE CRÉDITO";
    if (isReturn) return "COMPROBANTE DE DEVOLUCIÓN";
    return "COMPROBANTE DE VENTA";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-icons text-[18px]">print</span>
            Imprimir Ticket
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
      <div ref={ticketRef} className="ticket">
        {/* Header */}
        <div className="header center">
          <h1 className="bold">MODISTA</h1>
          <p>Sistema de Gestión Escolar</p>
          <p className="no-print">Vista previa - Se imprimirá en ticketera 80mm</p>
        </div>

        <div className="divider" />

        {/* Comprobante Info */}
        <div className="center" style={{ marginBottom: "4px" }}>
          <div className="bold" style={{ fontSize: "14px", letterSpacing: "1px" }}>
            {getComprobanteLabel()}
          </div>
          <div className="bold" style={{ fontSize: "16px", marginTop: "2px" }}>
            {numStr}
          </div>
          {isCreditNote && sale.originalSale && (
            <div className="text-xs text-neutral-500 mt-1">
              Anula venta #{sale.originalSale.number.toString().padStart(4, "0")}
            </div>
          )}
        </div>

        <div className="divider" />

        {/* Fecha, Vendedor, Cliente */}
        <div className="info-row">
          <span>Fecha:</span>
          <span>{formatDateTime(sale.createdAt)}</span>
        </div>
        <div className="info-row">
          <span>Vendedor:</span>
          <span>{sale.seller?.name || "Desconocido"}</span>
        </div>

        {sale.client && (
          <>
            <div className="info-row">
              <span>Cliente:</span>
              <span>{sale.client.fullName}</span>
            </div>
            {sale.client.dni && (
              <div className="info-row">
                <span>DNI:</span>
                <span>{sale.client.dni}</span>
              </div>
            )}
          </>
        )}

        {isVoided && sale.voidReason && (
          <div className="void-badge" style={{ color: "#dc2626" }}>
            ⚠ ANULADA - {sale.voidReason}
          </div>
        )}

        <div className="divider" />

        {/* Items Table */}
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
            {sale.items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <span className="item-name">{item.name}</span>
                  <span className="item-detail">
                    {item.type === "service" ? "SERVICIO" : "PRODUCTO"}
                    {item.unitCost !== undefined && item.unitCost > 0 && (
                      <> · Costo: {money(item.unitCost)}</>
                    )}
                  </span>
                </td>
                <td className="qty">{item.quantity}</td>
                <td className="price">{money(item.unitPrice)}</td>
                <td className="subtotal">{money(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="divider" />

        {/* Totals */}
        <div className="totals">
          <div className="row">
            <span>Subtotal</span>
            <span>{money(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="row" style={{ color: "#dc2626" }}>
              <span>Descuento</span>
              <span>-{money(sale.discount)}</span>
            </div>
          )}
          <div className="row total-row">
            <span>TOTAL</span>
            <span>{isReturn ? "-" : ""}{money(sale.total)}</span>
          </div>
        </div>

        <div className="divider" />

        {/* Payment Info */}
        <div className="payment-info">
          <div className="row">
            <span>
              <span className="material-icons" style={{ fontSize: "12px", verticalAlign: "middle", marginRight: "4px" }}>
                {PaymentMethodIcon(sale.paymentMethod, sale.type)}
              </span>
              {PaymentMethodLabel(sale.paymentMethod, sale.type)}
            </span>
          </div>
          {(sale.paymentMethod === "cash" || sale.paymentMethod === "transfer") && sale.amountReceived > 0 && (
            <>
              <div className="row">
                <span>Recibido</span>
                <span>{money(sale.amountReceived)}</span>
              </div>
              {sale.change > 0 && (
                <div className="row">
                  <span>Vuelto</span>
                  <span>{money(sale.change)}</span>
                </div>
              )}
            </>
          )}
          {sale.paymentMethod === "credit" && (
            <div className="row">
              <span>Queda a cuenta</span>
              <span>{money(sale.total)}</span>
            </div>
          )}
        </div>

        <div className="divider" />

        {/* Footer */}
        <div className="footer">
          <p>¡Gracias por su compra!</p>
          <p>Conserve este comprobante</p>
          {isReturn && <p>Devolución de venta #{sale.number}</p>}
          {isCreditNote && sale.originalSale && <p>Anula venta #{sale.originalSale.number.toString().padStart(4, "0")}</p>}
        </div>
      </div>
    </Modal>
  );
}