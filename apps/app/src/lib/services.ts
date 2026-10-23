import { callService, type Service, type ServiceContext } from '@vega/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { SupabaseStore } from './supabaseStore';

const store = supabase ? new SupabaseStore(supabase) : null;

function context(): ServiceContext {
  if (!store) throw new Error('Supabase não configurado');
  return { store, actor: 'user' };
}

/** Calls a service as the user. Every screen goes through here, never through Supabase directly. */
export function run<I, O>(service: Service<I, O>, input: I): Promise<O> {
  return callService(service, context(), input);
}

/** Reads a service's result and reloads on demand. Replaced by TanStack Query once modules need caching. */
export function useServiceQuery<I, O>(service: Service<I, O>, input: I) {
  const key = JSON.stringify(input);
  const stableInput = useMemo(() => input, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [state, setState] = useState<{ data: O | null; error: Error | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });

  const [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    run(service, stableInput).then(
      (data) => !cancelled && setState({ data, error: null, loading: false }),
      (error: Error) => !cancelled && setState({ data: null, error, loading: false }),
    );
    return () => {
      cancelled = true;
    };
  }, [service, stableInput, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { ...state, reload };
}
