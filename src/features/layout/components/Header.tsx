"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/shared/api/queryKeys";
import { useHeader } from "@/features/layout/components/HeaderContext";

type Props = {
  title?: string;
};

export function Header({ title }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { config } = useHeader();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const resolvedTitle = useMemo(() => {
    return title ?? config.title ?? "";
  }, [config.title, title]);

  const resolvedDescription = useMemo(() => {
    return config.description ?? "";
  }, [config.description]);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setCurrentDate(formatted);
    };

    updateDate();
    const interval = setInterval(updateDate, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = document.getElementById("dashboard-scroll");
    if (!el) return;

    const handleScroll = () => {
      setScrolled(el.scrollTop > 10);
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.documents() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.departments() }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header
      className={cn(
        "border-border/60 shrink-0 border-b bg-gradient-to-r from-emerald-50/80 to-white transition-shadow duration-200",
        scrolled ? "shadow-md" : "shadow-none"
      )}
    >
      <div className="h-20 px-8">
        <div className="flex h-full items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="min-w-0">
              {resolvedTitle ? (
                <div className="flex min-w-0 items-center gap-3">
                  <div className="truncate text-[24px] leading-7 font-semibold tracking-tight text-slate-900">
                    {resolvedTitle}
                  </div>
                  <div className="hidden items-center gap-2 text-xs text-slate-500 lg:flex">
                    <Calendar className="h-4 w-4" />
                    <span>{currentDate}</span>
                  </div>
                </div>
              ) : null}

              {resolvedDescription ? (
                <div className="mt-1 truncate text-sm text-slate-600">{resolvedDescription}</div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {config.actions ? (
              <div className="flex items-center gap-2">{config.actions}</div>
            ) : null}

            <div className="hidden items-center gap-2 rounded-md border bg-white/70 px-2.5 py-1.5 md:flex">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const q = searchValue.trim();
                  router.push(q ? `/documents?q=${encodeURIComponent(q)}` : "/documents");
                }}
                placeholder="Rechercher un document…"
                className="w-[260px] bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="Rechercher un document"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Rafraîchir"
              aria-label="Rafraîchir"
            >
              <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
