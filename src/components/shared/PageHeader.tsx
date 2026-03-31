"use client";

import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

import type {
  HeaderBreadcrumbItem,
  HeaderConfig,
} from "@/features/layout/components/HeaderContext";
import { useHeader } from "@/features/layout/components/HeaderContext";

export interface PageHeaderProps {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: HeaderBreadcrumbItem[];
}

export function PageHeader({ icon, title, description, actions, breadcrumb }: PageHeaderProps) {
  const { setConfig, reset } = useHeader();

  useEffect(() => {
    const config: HeaderConfig = { icon, title, description, actions, breadcrumb };
    setConfig(config);
    return () => reset();
  }, [actions, breadcrumb, description, icon, reset, setConfig, title]);

  return null;
}
