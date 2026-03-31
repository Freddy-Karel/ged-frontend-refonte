"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: Props) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn("flex flex-wrap items-center gap-1 text-sm", className)}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={`${item.label}-${idx}`} className="flex items-center gap-1">
            {idx > 0 ? <ChevronRight className="text-muted-foreground h-4 w-4" /> : null}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-slate-700 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span
                className={cn("truncate", isLast ? "font-medium text-slate-900" : "text-slate-700")}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
