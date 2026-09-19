import { useEffect, useState, useCallback, useRef } from 'react';
import { listSchools, createSchool, updateSchool, deleteSchool } from '../../../api/schools';
import type { School, CreateSchoolPayload, UpdateSchoolPayload } from '../types';

interface UseSchoolsReturn {
  schools: School[];
  total: number;
  loading: boolean;
  error: string;
  page: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (search: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  fetchSchools: () => Promise<void>;
  createSchool: (data: CreateSchoolPayload) => Promise<void>;
  updateSchool: (id: string, data: UpdateSchoolPayload) => Promise<void>;
  toggleActive: (id: string, active: boolean) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  refetch: () => void;
  togglingId: string | null;
}

export function useSchools(): UseSchoolsReturn {
  const [schools, setSchools] = useState<School[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const togglingIdRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [search]);

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await listSchools({ page, limit, search: debouncedSearch.trim() || undefined });
      if (isMountedRef.current) {
        setSchools(res.items);
        setTotal(res.total);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Error al cargar escuelas');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const createSchoolItem = async (data: CreateSchoolPayload) => {
    await createSchool(data);
    fetchSchools();
  };

  const updateSchoolItem = async (id: string, data: UpdateSchoolPayload) => {
    await updateSchool(id, data);
    fetchSchools();
  };

  const toggleActive = async (id: string, active: boolean) => {
    if (togglingIdRef.current !== null && togglingIdRef.current !== id) {
      return;
    }
    togglingIdRef.current = id;
    setTogglingId(id);

    const previousSchools = schools;
    setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));

    try {
      await updateSchool(id, { active });
    } catch (err) {
      setSchools(previousSchools);
      throw err;
    } finally {
      togglingIdRef.current = null;
      setTogglingId(null);
    }
  };

  const deleteSchoolItem = async (id: string) => {
    await deleteSchool(id);
    fetchSchools();
  };

  const refetch = () => {
    fetchSchools();
  };

  return {
    schools,
    total,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    limit,
    setLimit,
    fetchSchools,
    createSchool: createSchoolItem,
    updateSchool: updateSchoolItem,
    toggleActive,
    deleteSchool: deleteSchoolItem,
    refetch,
    togglingId,
  };
}