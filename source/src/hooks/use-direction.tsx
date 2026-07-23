import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Direction = "ltr" | "rtl";
const STORAGE_KEY = "medicore-direction";

type DirectionContextValue = {
  direction: Direction;
  setDirection: (d: Direction) => void;
  toggleDirection: () => void;
  mounted: boolean;
};

const DirectionContext = createContext<DirectionContextValue | null>(null);

function readInitialDirection(): Direction {
  if (typeof document === "undefined") return "ltr";
  // Source of truth is the dir attribute the inline init script already set on <html>.
  return document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}

function applyDirection(dir: Direction) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("dir", dir);
}

export function DirectionProvider({ children }: { children: ReactNode }) {
  // Start with "ltr" on the server render, then sync from the DOM on mount.
  // <html suppressHydrationWarning> lets the pre-hydration dir attribute
  // stick without React reconciling it away.
  const [direction, setDirState] = useState<Direction>("ltr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = readInitialDirection();
    setDirState(current);
    setMounted(true);
  }, []);

  const setDirection = useCallback((next: Direction) => {
    setDirState(next);
    applyDirection(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleDirection = useCallback(() => {
    setDirState((prev) => {
      const next: Direction = prev === "rtl" ? "ltr" : "rtl";
      applyDirection(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ direction, setDirection, toggleDirection, mounted }),
    [direction, setDirection, toggleDirection, mounted],
  );

  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}

export function useDirection(): DirectionContextValue {
  const ctx = useContext(DirectionContext);
  if (!ctx) throw new Error("useDirection must be used within <DirectionProvider>");
  return ctx;
}
