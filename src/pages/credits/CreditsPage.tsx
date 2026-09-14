import { useState, useEffect, useCallback } from 'react';
import {
  getCreditsSummary,
  listCredits,
  getRecentHistory,
  settleDebt,
  type CreditsSummary,
  type DebtorItem,
  type RecentMovement,
} from '../../api/credits';
import { exportToCSV } from '../../lib/exportToCSV';
import { getDaysSince } from './components/Badges';
import {
  CreditsKPIs,
  RecentHistoryPanel,
  SettleDebtModal,
  ClientCreditModal,
  DebtorTable,
} from './components';

interface SettleTarget {
  clientId: string;
  clientName: string;
  debt: number;
}

const CreditsPage = () => {
  const [summary, setSummary] = useState<CreditsSummary | null>(null);
  const [debtors, setDebtors] = useState<DebtorItem[]>([]);
  const [history, setHistory] = useState<RecentMovement[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDebtors, setLoadingDebtors] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [settleTarget, setSettleTarget] = useState<SettleTarget | null>(null);
  const [detailClient, setDetailClient] = useState<DebtorItem | null>(null);

  const fetchAll = useCallback(async () => {
    setLoadingSummary(true);
    setLoadingDebtors(true);
    setLoadingHistory(true);
    try {
      const [s, d, h] = await Promise.all([
        getCreditsSummary(),
        listCredits({ limit: 50 }),
        getRecentHistory(5),
      ]);
      setSummary(s);
      setDebtors(d.items || []);
      setHistory(h || []);
    } catch (e) {
      console.error('Error cargando créditos', e);
    } finally {
      setLoadingSummary(false);
      setLoadingDebtors(false);
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExport = () => {
    const flat = debtors.map(d => ({
      Cliente: d.client.fullName,
      DNI: d.client.dni,
      Saldo: d.balance,
      UltimaActividad: d.lastCreditAt ? new Date(d.lastCreditAt).toLocaleDateString('es-AR') : '-',
      Estado: d.balance <= 0 ? 'SALDADO' : getDaysSince(d.lastCreditAt) >= 30 ? 'VENCIDO' : 'VIGENTE',
    }));
    exportToCSV(flat, 'deudores_cuentas_corrientes');
  };

  const handleSettle = async (payload: { amount: number; method: 'cash' | 'transfer'; note?: string }) => {
    if (!settleTarget) return;
    await settleDebt(settleTarget.clientId, payload);
    setSettleTarget(null);
    fetchAll();
  };

  const openDetail = (item: DebtorItem) => {
    setDetailClient(item);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Cuentas corrientes</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestioná los saldos pendientes de tus clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <span className="material-icons text-base">download</span>
            Exportar deudores
          </button>
          <button
            onClick={() => setSettleTarget({ clientId: '', clientName: 'General', debt: 0 })}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="material-icons text-base">payments</span>
            Registrar pago
          </button>
        </div>
      </div>

      <CreditsKPIs summary={summary} loading={loadingSummary} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DebtorTable
            debtors={debtors}
            loading={loadingDebtors}
            onSettle={(item) => setSettleTarget({
              clientId: item.client.id,
              clientName: item.client.fullName,
              debt: item.balance,
            })}
            onViewDetail={openDetail}
          />
        </div>

        <div className="xl:col-span-1">
          <RecentHistoryPanel
            movements={history}
            loading={loadingHistory}
          />
        </div>
      </div>

      {settleTarget && settleTarget.clientId && (
        <SettleDebtModal
          isOpen={true}
          clientName={settleTarget.clientName}
          currentDebt={settleTarget.debt}
          onClose={() => setSettleTarget(null)}
          onConfirm={handleSettle}
        />
      )}

      {detailClient && (
        <ClientCreditModal
          isOpen={true}
          client={detailClient}
          onClose={() => setDetailClient(null)}
        />
      )}
    </div>
  );
};

export default CreditsPage;
