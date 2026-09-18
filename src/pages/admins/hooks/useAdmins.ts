import { useEffect, useState, useCallback, useRef } from 'react';
import { adminsService, type Admin, type AdminListResponse, type CreateAdminPayload, type UpdateAdminPayload } from '../../../api/admins';

interface UseAdminsReturn {
  admins: Admin[];
  total: number;
  loading: boolean;
  error: string;
  page: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (search: string) => void;
  fetchAdmins: () => Promise<void>;
  createAdmin: (data: CreateAdminPayload) => Promise<void>;
  updateAdmin: (id: string, data: UpdateAdminPayload) => Promise<void>;
  toggleActive: (id: string, active: boolean) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  refetch: () => void;
  togglingId: string | null;
}

export function useAdmins(): UseAdminsReturn {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [limit] = useState(20);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit, search: debouncedSearch.trim() || undefined };
      const res: AdminListResponse = await adminsService.list(params);
      if (isMountedRef.current) {
        setAdmins(res.items);
        setTotal(res.total);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Error al cargar administradores');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const createAdmin = async (data: CreateAdminPayload) => {
    await adminsService.create(data);
    fetchAdmins();
  };

  const updateAdmin = async (id: string, data: UpdateAdminPayload) => {
    await adminsService.update(id, data);
    fetchAdmins();
  };

  const toggleActive = async (id: string, active: boolean) => {
    if (togglingId !== null && togglingId !== id) {
      return;
    }
    setTogglingId(id);
    const previousAdmins = admins;
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)));
    try {
      await adminsService.update(id, { active });
    } catch (err: any) {
      setAdmins(previousAdmins);
      throw err;
    } finally {
      setTogglingId(null);
    }
  };

  const deleteAdmin = async (id: string) => {
    await adminsService.delete(id);
    fetchAdmins();
  };

  const refetch = () => {
    fetchAdmins();
  };

  return {
    admins,
    total,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    toggleActive,
    deleteAdmin,
    refetch,
    togglingId,
  };
}