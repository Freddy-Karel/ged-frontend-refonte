"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import type { DocumentResponse } from "@/types/api/document";
import { formatDate } from "@/lib/date";

interface RecentDocumentsTableProps {
  documents: DocumentResponse[];
  loading?: boolean;
}

const statusConfig = {
  DRAFT: { label: "Brouillon", variant: "secondary" as const },
  VALIDATED: { label: "Validé", variant: "default" as const },
  ARCHIVED: { label: "Archivé", variant: "outline" as const },
};

export function RecentDocumentsTable({ documents, loading }: RecentDocumentsTableProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Documents récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted flex animate-pulse items-center gap-4 rounded-lg p-3"
              >
                <div className="bg-muted-foreground/20 h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted-foreground/20 h-4 w-1/3 rounded" />
                  <div className="bg-muted-foreground/20 h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Documents récents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-12 w-12 text-slate-300" />
            <div className="mt-3 text-sm text-slate-600">Aucun document récent</div>
            <div className="mt-1 text-xs text-slate-500">
              Importez un document pour le voir apparaître ici
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-3 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {doc.departmentName} → {doc.categoryName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <Badge variant={statusConfig[doc.status].variant} className="text-xs">
                    {statusConfig[doc.status].label}
                  </Badge>
                  <span className="text-muted-foreground hidden text-xs sm:inline">
                    {formatDate(doc.createdAt)}
                  </span>
                  <Link href={`/documents?previewId=${doc.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
