import { useState, useEffect, useCallback } from "react";
import {
  listSales,
  getSalesSummary,
  getSale,
  type ListSalesParams,
  type SalesSummary,
} from "../../api/sales";
import type { SaleRow } from "../../api/types";
import { exportToCSV } from "../../lib/exportToCSV";
import PageHeader from "../../components/PageHeader";
import SaleDetailModal from "./components/SaleDetailModal";
import CreditNoteModal from "./components/CreditNoteModal";

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function StatusBadge({ type, voided }: { type: string; voided: boolean }) {
  if (voided) {
    return (
      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-neutral-100 text-neutral-500 tracking-wider">
        ANULADA
      </span>
    );
  }
  if (type === "return") {
    return (
      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-100 text-red-600 tracking-wider">
        DEVOLUCIÓN
      </span>
    );
  }
  if (type === "credit_note") {
    return (
      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700 tracking-wider">
        NOTA CRÉDITO
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-green-100 text-green-700 tracking-wider">
      VENTA
    </span>
  );
}

function MethodCell({ method, type }: { method: string; type: string }) {
  if (type === "return") {
    return (
      <span className="flex items-center gap-1.5 text-neutral-700 font-medium">
        <span className="material-icons text-[16px] text-neutral-400">payments</span>
        Reintegro
      </span>
    );
  }
  if (type === "credit_note") {
    return (
      <span className="flex items-center gap-1.5 text-blue-700 font-medium">
        <span className="material-icons text-[16px]">receipt_long</span>
        Nota Crédito
      </span>
    );
  }
  if (method === "cash") {
    return (
      <span className="flex items-center gap-1.5 text-green-700 font-medium">
        <span className="material-icons text-[16px]">payments</span>
        Efectivo
      </span>
    );
  }
  if (method === "credit") {
    return (
      <span className="flex items-center gap-1.5 text-amber-700 font-medium">
        <span className="material-icons text-[16px]">credit_card</span>
        Crédito
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-neutral-700 font-medium">
      <span className="material-icons text-[16px]">account_balance</span>
      Transferencia
    </span>
  );
}

function KPICard({ title, value, badge, badgeColor = "green" }: { title: string; value: string | number; badge?: string; badgeColor?: "green" | "red" }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-center min-h-[100px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 leading-none">{value}</p>
        </div>
        {badge && (
          <span className={`px-2 py-1 text-xs font-bold rounded-md flex items-center gap-1 ${
            badgeColor === "green" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}>
            {badgeColor === "green" ? <span className="material-icons text-[12px]">trending_up</span> : null}
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [params, setParams] = useState<ListSalesParams>({ page: 1, limit: 10, sortOrder: "desc", sortBy: "createdAt" });
  const [activeTab, setActiveTab] = useState<"all" | "sale" | "return" | "credit_note">("all");
  const [totalCount, setTotalCount] = useState(0);
  const [detailSale, setDetailSale] = useState<SaleRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creditNoteSaleData, setCreditNoteSaleData] = useState<SaleRow | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = { ...params };
      if (activeTab !== "all") queryParams.type = activeTab;
      
      const result = await listSales(queryParams);
      setSales(result.items || []);
      setTotalCount(result.total);
    } catch (error) {
      console.error("Failed to load sales", error);
    } finally {
      setLoading(false);
    }
  }, [params, activeTab]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const result = await getSalesSummary();
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const openDetail = async (sale: SaleRow) => {
    setDetailLoading(true);
    try {
      const fullSale = await getSale(sale.id);
      setDetailSale(fullSale);
    } catch (error) {
      console.error("Failed to load sale detail", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setDetailSale(null);

  const openCreditNoteModal = (sale: SaleRow) => {
    setCreditNoteSaleData(sale);
  };

  const handleCreditNoteSuccess = () => {
    setCreditNoteSaleData(null);
    fetchSales();
    fetchSummary();
  };

  const closeCreditNoteModal = () => {
    setCreditNoteSaleData(null);
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleExport = () => {
    const flatSales = sales.map(s => {
      let typeLabel = "SALE";
      let receiptNumber = `#${s.number.toString().padStart(4, "0")}`;
      if (s.type === "return") {
        typeLabel = "RETURN";
        receiptNumber += "R";
      } else if (s.type === "credit_note") {
        typeLabel = "CREDIT_NOTE";
        receiptNumber += "NC";
      }
      return {
        ReceiptNumber: receiptNumber,
        Type: typeLabel,
        Date: new Date(s.createdAt).toLocaleString("es-AR"),
        Client: s.client?.fullName || "Consumidor Final",
        Seller: s.seller?.name || "Desconocido",
        Method: s.paymentMethod,
        Total: s.total,
        Status: s.voided ? "VOIDED" : "OK"
      };
    });
    exportToCSV(flatSales, "sales_history");
  };

  const handleClearFilters = () => {
    setParams({ page: 1, limit: 10, sortOrder: "desc", sortBy: "createdAt" });
    setActiveTab("all");
  };

  return (
    <>
      <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* Header */}
      <PageHeader 
        title="Historial de ventas" 
        description="Consultá, filtrá y gestioná todas las transacciones del sistema"
        primaryAction={{ label: "Exportar", icon: "download", onClick: handleExport }} 
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading || !summary ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-[100px] bg-white border border-neutral-200 rounded-xl animate-pulse" />)
        ) : (
          <>
            <KPICard 
              title="Ventas Hoy" 
              value={summary.salesToday} 
              badge={summary.salesGrowth > 0 ? `+${summary.salesGrowth}%` : undefined} 
            />
            <KPICard 
              title="Total Facturado" 
              value={formatMoney(summary.totalRevenue)} 
            />
            <KPICard 
              title="Devoluciones" 
              value={summary.returnsCount} 
              badge={summary.returnsAmount > 0 ? `-${formatMoney(summary.returnsAmount)}` : undefined}
              badgeColor="red"
            />
            <KPICard 
              title="Ticket Promedio" 
              value={formatMoney(summary.averageTicket)} 
            />
          </>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Filters Bar 1: Search & Date */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[250px] max-w-sm">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px]">search</span>
            <input 
              type="text" 
              value={params.search || ""}
              placeholder="Buscar comprobante..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-neutral-50"
              onChange={(e) => setParams(p => ({ ...p, search: e.target.value, page: 1 }))}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-600">
            <span className="material-icons text-[16px] text-neutral-400">calendar_today</span>
            <input 
              type="date" 
              className="bg-transparent outline-none w-32"
              value={params.fromDate ? params.fromDate.split('T')[0] : ""}
              onChange={(e) => setParams(p => ({ ...p, fromDate: e.target.value ? new Date(e.target.value).toISOString() : undefined, page: 1 }))}
            />
            <span className="text-neutral-400">-</span>
            <input 
              type="date" 
              className="bg-transparent outline-none w-32"
              value={params.toDate ? params.toDate.split('T')[0] : ""}
              onChange={(e) => setParams(p => ({ ...p, toDate: e.target.value ? new Date(e.target.value).toISOString() : undefined, page: 1 }))}
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex bg-neutral-100 rounded-lg p-1">
              {[
                { id: "all", label: "Todos" },
                { id: "sale", label: "Ventas" },
                { id: "return", label: "Devoluciones" },
                { id: "credit_note", label: "Notas de crédito" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setParams(p => ({ ...p, page: 1 })); }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button onClick={handleClearFilters} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Limpiar
            </button>
          </div>
        </div>

        {/* Filters Bar 2: Selects */}
        <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap items-center gap-3 bg-neutral-50/50">
          <select 
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg outline-none bg-white min-w-[160px] text-neutral-700"
            value={params.sellerId || ""}
            onChange={(e) => setParams(p => ({ ...p, sellerId: e.target.value || undefined, page: 1 }))}
          >
            <option value="">Vendedor: Todos</option>
          </select>

          <select 
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg outline-none bg-white min-w-[160px] text-neutral-700"
            value={params.paymentMethod || ""}
            onChange={(e) => setParams(p => ({ ...p, paymentMethod: e.target.value as any || undefined, page: 1 }))}
          >
            <option value="">Método: Todos</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="credit">Crédito</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {["Comprobante", "Tipo", "Fecha / Hora", "Cliente", "Vendedor", "Método", "Total", "Acciones"].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-neutral-100 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center text-neutral-400">
                    No hay ventas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                sales.map(sale => {
                  const isReturn = sale.type === "return";
                  const isCreditNote = sale.type === "credit_note";
                  const numStr = `#${sale.number.toString().padStart(4, "0")}${isReturn ? 'R' : isCreditNote ? 'NC' : ''}`;
                  const date = new Date(sale.createdAt);
                  const timeStr = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
                  const canEmitCreditNote = sale.type === "sale" && !sale.voided;
                  
                  return (
                    <tr key={sale.id} className={`hover:bg-neutral-50/60 transition-colors ${sale.voided ? "opacity-60" : ""}`}>
                      <td className={`px-5 py-4 font-bold ${isReturn ? "text-red-500" : isCreditNote ? "text-blue-600" : "text-neutral-800"}`}>
                        <span className={sale.voided ? "line-through text-neutral-400" : ""}>{numStr}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge type={sale.type} voided={sale.voided} />
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {timeStr}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${sale.voided ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                            {sale.client?.fullName || "Consumidor Final"}
                          </span>
                          {sale.client && sale.client.balance > 0 && !sale.voided && (
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold uppercase rounded flex flex-col items-center leading-none">
                              <span>Con Saldo</span>
                              <span>${sale.client.balance}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-neutral-600 font-medium">
                        {sale.seller?.name || "Desconocido"}
                      </td>
                      <td className="px-5 py-4">
                        <MethodCell method={sale.paymentMethod} type={sale.type} />
                      </td>
                      <td className={`px-5 py-4 font-bold ${isReturn ? "text-red-500" : isCreditNote ? "text-blue-600" : "text-neutral-900"}`}>
                        <span className={sale.voided ? "line-through text-neutral-400" : ""}>
                          {isReturn ? "-" : ""}{formatMoney(sale.total)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {sale.voided && (
                            <button className="text-neutral-400 hover:text-neutral-600 transition-colors p-1.5 rounded" title={sale.voidReason || "Venta Anulada"}>
                              <span className="material-icons text-[18px]">info</span>
                            </button>
                          )}
                          {canEmitCreditNote && (
                            <button
                              onClick={() => openCreditNoteModal(sale)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors p-1.5 rounded"
                              title="Emitir Nota de Crédito"
                            >
                              <span className="material-icons text-[20px]">receipt_long</span>
                            </button>
                          )}
                          <button
                            onClick={() => openDetail(sale)}
                            disabled={detailLoading}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors p-1.5 rounded"
                            title="Ver ticket"
                          >
                            <span className="material-icons text-[20px]">print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && totalCount > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <span className="text-sm text-neutral-500">
              Mostrando <span className="font-semibold text-neutral-700">{(params.page! - 1) * params.limit! + 1}-{Math.min(params.page! * params.limit!, totalCount)}</span> de <span className="font-semibold text-neutral-700">{totalCount}</span> ventas de hoy
            </span>
            <div className="flex items-center gap-3">
              <select 
                className="px-2 py-1 text-sm border border-neutral-200 rounded outline-none bg-white text-neutral-600"
                value={params.limit}
                onChange={(e) => setParams(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
              >
                <option value="8">8 por página</option>
                <option value="15">15 por página</option>
                <option value="50">50 por página</option>
              </select>
              
              <div className="flex gap-1">
                <button 
                  disabled={params.page === 1}
                  onClick={() => setParams(p => ({ ...p, page: p.page! - 1 }))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40 transition-colors bg-white"
                >
                  <span className="material-icons text-[16px]">chevron_left</span>
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-sm">
                  {params.page}
                </button>
                <button 
                  disabled={params.page! * params.limit! >= totalCount}
                  onClick={() => setParams(p => ({ ...p, page: p.page! + 1 }))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40 transition-colors bg-white"
                >
                  <span className="material-icons text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <SaleDetailModal isOpen={!!detailSale} onClose={closeDetail} sale={detailSale} />
    <CreditNoteModal
      isOpen={!!creditNoteSaleData}
      sale={creditNoteSaleData}
      onClose={closeCreditNoteModal}
      onSuccess={handleCreditNoteSuccess}
    />
    </>
  );
}
