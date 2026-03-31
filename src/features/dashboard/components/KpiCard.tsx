"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "emerald" | "amber" | "green" | "purple" | "orange";
  href?: string;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
}

const colorClasses = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: "text-emerald-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: "text-amber-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    icon: "text-green-500",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "text-purple-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    icon: "text-orange-500",
  },
};

export function KpiCard({ title, value, icon: Icon, color, href, trend, subtitle }: KpiCardProps) {
  const colors = colorClasses[color];

  const content = (
    <Card className="border-border/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground font-sans text-sm font-medium">{title}</p>
            <p className={cn("font-heading mt-2 text-3xl font-bold", colors.text)}>{value}</p>
            {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
            {trend && (
              <p
                className={cn(
                  "mt-2 text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% ce mois
              </p>
            )}
          </div>
          <div className={cn("rounded-xl p-3", colors.bg)}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
