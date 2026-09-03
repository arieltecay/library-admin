import { useEffect, useState, useCallback } from 'react';
import { getOverview, type DashboardOverview } from '../../../api/dashboard';

export function useDashboard(initialFrom?: string, initialTo?: string) {
  const [from, setFrom] = useState(initialFrom ?? new Date().toISOString().split('T')[0] ?? '');
  const [to, setTo] = useState(initialTo ?? new Date().toISOString().split('T')[0] ?? '');
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (fromDate: string, toDate: string) => {
    try {
      setLoading(true);
      setError('');
      const result = await getOverview({ from: fromDate, to: toDate });
      setData(result);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Error cargando el dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(from, to);
  }, [from, to, load]);

  const empty = !data || data.sales.count === 0;

  return {
    from,
    setFrom,
    to,
    setTo,
    data,
    loading,
    error,
    empty,
    reload: load,
  };
}