import { useCallback, useEffect, useState } from 'react';
import { Api } from '@/services/api';
import { Medicine } from '@/types';

type State = {
  data: Medicine | null;
  loading: boolean;
  error: string | null;
};

export function useMedicine(id: string | undefined) {
  const [state, setState] = useState<State>({
    data: null,
    loading: !!id,
    error: null,
  });

  const fetchOne = useCallback(async () => {
    if (!id) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await Api.getMedicineById(id);
      setState({ data, loading: false, error: null });
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message || 'Failed to load' });
    }
  }, [id]);

  useEffect(() => {
    fetchOne();
  }, [fetchOne]);

  return { ...state, refetch: fetchOne };
}
