"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type HeaderBreadcrumbItem = {
  label: string;
  href?: string;
};

export type HeaderConfig = {
  icon?: LucideIcon;
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: HeaderBreadcrumbItem[];
};

type HeaderContextValue = {
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
  reset: () => void;
};

const HeaderContext = createContext<HeaderContextValue | null>(null);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<HeaderConfig>({});

  const setConfig = useCallback((next: HeaderConfig) => {
    setConfigState(next);
  }, []);

  const reset = useCallback(() => {
    setConfigState({});
  }, []);

  const value = useMemo(() => ({ config, setConfig, reset }), [config, reset, setConfig]);

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) {
    throw new Error("useHeader must be used within HeaderProvider");
  }
  return ctx;
}
