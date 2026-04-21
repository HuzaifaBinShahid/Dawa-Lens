import { useEffect, useRef, useState } from 'react';
import { Api } from '@/services/api';
import { Medicine } from '@/types';

type State = {
  results: Medicine[];
  similar: Medicine[];
  loading: boolean;
  error: string | null;
};

const initial: State = {
  results: [],
  similar: [],
  loading: false,
  error: null,
};

export function useMedicineSearch(query: string, delay = 500) {
  const [state, setState] = useState<State>(initial);
  const latestRequest = useRef(0);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setState(initial);
      return;
    }
    const requestId = ++latestRequest.current;

    const handle = setTimeout(async () => {
      if (requestId !== latestRequest.current) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const results = await Api.listMedicines(term, 8);

        if (results.length > 0) {
          if (requestId === latestRequest.current) {
            setState({ results, similar: [], loading: false, error: null });
          }
          return;
        }

        const fuzzy = await Api.searchMedicines(term, 6);
        const similar = [
          ...(fuzzy.best ? [fuzzy.best] : []),
          ...(fuzzy.alternates || []),
        ];
        if (requestId === latestRequest.current) {
          setState({ results: [], similar, loading: false, error: null });
        }
      } catch (err: any) {
        if (requestId === latestRequest.current) {
          setState({
            results: [],
            similar: [],
            loading: false,
            error: err.message || 'Search failed',
          });
        }
      }
    }, delay);

    return () => clearTimeout(handle);
  }, [query, delay]);

  return state;
}
