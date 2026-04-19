import { useEffect, useRef, useState } from 'react';
import { Api } from '@/services/api';
import { Medicine } from '@/types';

type State = {
  results: Medicine[];
  loading: boolean;
  error: string | null;
};

export function useMedicineSearch(query: string, delay = 400) {
  const [state, setState] = useState<State>({
    results: [],
    loading: false,
    error: null,
  });
  const latestRequest = useRef(0);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setState({ results: [], loading: false, error: null });
      return;
    }
    const requestId = ++latestRequest.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    const handle = setTimeout(async () => {
      try {
        const results = await Api.listMedicines(term, 6);
        if (requestId === latestRequest.current) {
          setState({ results, loading: false, error: null });
        }
      } catch (err: any) {
        if (requestId === latestRequest.current) {
          setState({ results: [], loading: false, error: err.message || 'Search failed' });
        }
      }
    }, delay);

    return () => clearTimeout(handle);
  }, [query, delay]);

  return state;
}
