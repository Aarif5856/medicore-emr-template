import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useMockQuery — demo-only async simulation for the marketplace template.
 *
 * Simulates a network fetch with a small delay so every data surface can
 * demonstrate its Loading / Error / Empty / Populated / Edge states without
 * a real backend. Buyers should replace calls to this hook with a real
 * data hook (e.g. TanStack Query's `useQuery`) when wiring their API:
 *
 *   // Before (template):
 *   const { data, isLoading, isError, refetch } = useMockQuery(PATIENTS);
 *
 *   // After (real API):
 *   const { data, isLoading, isError, refetch } = useQuery({
 *     queryKey: ["patients"],
 *     queryFn: fetchPatients,
 *   });
 *
 * State can also be forced for a screenshot / QA pass via the URL query
 * param `?mockState=loading|error|empty` (client-only, dev convenience).
 */

export type MockState = "loading" | "error" | "empty" | "ok";

export interface UseMockQueryOptions {
  /** Simulated latency in ms. Defaults to a random 600-900ms. */
  delay?: number;
  /** Force a state for demos/screenshots. Overrides ?mockState= param. */
  forceState?: MockState;
}

export interface MockQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

function readForcedState(): MockState | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("mockState");
  if (v === "loading" || v === "error" || v === "empty" || v === "ok") return v;
  return null;
}

export function useMockQuery<T>(source: T, options: UseMockQueryOptions = {}): MockQueryResult<T> {
  const forced = options.forceState ?? readForcedState() ?? "ok";
  const initialDelay = useRef(options.delay ?? 600 + Math.floor(Math.random() * 300));

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(forced === "error");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Forced states are unconditional so QA can inspect them indefinitely.
    if (forced === "loading") {
      setIsLoading(true);
      setIsError(false);
      return;
    }
    if (forced === "error") {
      setIsLoading(false);
      setIsError(true);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    const t = setTimeout(() => {
      if (cancelled) return;
      setIsLoading(false);
    }, initialDelay.current);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [tick, forced]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  let data: T | undefined;
  if (!isLoading && !isError) {
    data = forced === "empty" ? (emptyOf(source) as T) : source;
  }

  return { data, isLoading, isError, refetch };
}

function emptyOf<T>(source: T): T {
  if (Array.isArray(source)) return [] as unknown as T;
  return source;
}
