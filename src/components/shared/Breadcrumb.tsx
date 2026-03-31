"use client";

import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: "chevron" | "slash" | "arrow";
}

function Separator({ variant }: { variant: BreadcrumbProps["separator"] }) {
  if (variant === "chevron") return <span className="text-slate-400">›</span>;
  if (variant === "slash") return <span className="text-slate-400">/</span>;
  return <span className="text-slate-400">→</span>;
}

export function Breadcrumb({ items, separator = "arrow" }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm font-semibold">
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 ? <Separator variant={separator} /> : null}
          {item.href ? (
            <Link href={item.href} className="text-emerald-600 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span
              className={
                index === items.length - 1 ? "font-semibold text-slate-900" : "text-slate-700"
              }
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
