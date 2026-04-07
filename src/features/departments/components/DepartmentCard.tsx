"use client";

import * as React from "react";
import Link from "next/link";
import { useMemo } from "react";
import { memo } from "react";
import { Building2, Folder, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import type { DepartmentResponse } from "@/types/api/department";
import type { DocumentStatus } from "@/types/domain/document";

function countByStatus(statuses: Array<DocumentStatus | null | undefined>) {
  return statuses.reduce(
    (acc, s) => {
      if (!s) return acc;
      if (s === "DRAFT") acc.DRAFT += 1;
      if (s === "VALIDATED") acc.VALIDATED += 1;
      if (s === "ARCHIVED") acc.ARCHIVED += 1;
      return acc;
    },
    { DRAFT: 0, VALIDATED: 0, ARCHIVED: 0 }
  );
}

export const DepartmentCard = memo(function DepartmentCard({
  department,
}: {
  department: DepartmentResponse;
}) {
  const categoriesQuery = useCategories({ departmentId: department.id, activeOnly: false });
  const documentsQuery = useDocuments({ departmentId: department.id, activeOnly: false });

  const stats = useMemo(() => {
    const categories = categoriesQuery.data ?? [];
    const documents = documentsQuery.data ?? [];

    const activeCategories = categories.filter((c) => c.active).length;
    const inactiveCategories = categories.length - activeCategories;

    const activeDocuments = documents.filter((d) => d.active).length;
    const inactiveDocuments = documents.length - activeDocuments;

    const byStatus = countByStatus(documents.map((d) => d.status));

    return {
      categoriesTotal: categories.length,
      categoriesActive: activeCategories,
      categoriesInactive: inactiveCategories,
      documentsTotal: documents.length,
      documentsActive: activeDocuments,
      documentsInactive: inactiveDocuments,
      byStatus,
    };
  }, [categoriesQuery.data, documentsQuery.data]);

  const isLoading = categoriesQuery.isLoading || documentsQuery.isLoading;
  const hasError = categoriesQuery.error || documentsQuery.error;

  return (
    <div className="flex flex-col rounded-xl border bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-200/60 hover:shadow-xl">
      {/* Header */}
      <div className="border-border/50 border-b p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <h3 className="font-heading truncate text-lg font-semibold text-slate-900">
                {department.name}
              </h3>
            </div>
            {department.description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                {department.description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-400 italic">Aucune description</p>
            )}
          </div>
          <Badge variant={department.active ? "success" : "secondary"} className="flex-shrink-0">
            {department.active ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Actif
              </span>
            ) : (
              "Inactif"
            )}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-100/50 bg-emerald-50/50 p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <Folder className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-sans text-xs text-slate-500">Catégories</p>
              <p className="font-heading text-2xl font-bold text-emerald-600">
                {isLoading ? "…" : stats.categoriesTotal}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-emerald-100/50 bg-emerald-50/50 p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-sans text-xs text-slate-500">Documents</p>
              <p className="font-heading text-2xl font-bold text-emerald-600">
                {isLoading ? "…" : stats.documentsTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Detail stats */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Catégories actives</span>
            <span className="font-medium text-slate-900">
              {isLoading ? "…" : `${stats.categoriesActive}/${stats.categoriesTotal}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Documents actifs</span>
            <span className="font-medium text-slate-900">
              {isLoading ? "…" : `${stats.documentsActive}/${stats.documentsTotal}`}
            </span>
          </div>
        </div>

        {/* Status breakdown */}
        {!isLoading && stats.documentsTotal > 0 && (
          <div className="border-border/50 mt-4 border-t pt-4">
            <p className="mb-2 text-xs text-slate-500">État des documents</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {stats.byStatus.DRAFT} Brouillons
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {stats.byStatus.VALIDATED} Validés
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                {stats.byStatus.ARCHIVED} Archivés
              </span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 text-xs text-slate-400">Chargement des statistiques…</div>
        )}

        {hasError && (
          <div className="mt-4 text-xs text-red-500">Impossible de charger les statistiques.</div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto p-5 pt-0">
        <Link href={`/departments/${department.id}`} className="block">
          <Button
            variant="outline"
            className="group w-full border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span>Accéder au département</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
});
