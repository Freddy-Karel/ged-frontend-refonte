"use client";

import { useMemo, useState } from "react";
import { Download, Eye, FileText, Search } from "lucide-react";

import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildDownloadUrl, buildOpenUrl, buildPreviewUrl } from "@/shared/api/services/files";
import { DocumentDeleteDialog } from "@/features/documents/components/DocumentDeleteDialog";
import { DocumentFormDialog } from "@/features/documents/components/DocumentFormDialog";
import type { CategoryResponse } from "@/types/api/category";
import type { DocumentResponse } from "@/types/api/document";

type Props = {
  departmentId: number;
  categories: CategoryResponse[];
  documents: DocumentResponse[];
  isLoading?: boolean;
};

function statusVariant(status: DocumentResponse["status"]) {
  if (status === "VALIDATED") return "default";
  if (status === "ARCHIVED") return "secondary";
  return "outline";
}

export function DocumentList({ departmentId, categories, documents, isLoading }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const selectedDocumentId = selectedDocument?.id ?? null;

  const previewUrl = useMemo(() => {
    if (!selectedDocumentId) return null;
    return buildPreviewUrl(selectedDocumentId);
  }, [selectedDocumentId]);

  const isPdf = useMemo(() => {
    return (selectedDocument?.mimeType ?? "").toLowerCase() === "application/pdf";
  }, [selectedDocument?.mimeType]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      // Category filter
      if (categoryFilter !== "all" && d.categoryId !== Number(categoryFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && d.status !== statusFilter) {
        return false;
      }

      // Search filter (title, reference, description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [d.title, d.referenceCode, d.description].join(" ").toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [documents, categoryFilter, statusFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [filteredDocuments]);

  const categoriesById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  return (
    <div className="space-y-3">
      {/* Filters bar */}
      <div className="bg-card flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="VALIDATED">Validé</SelectItem>
            <SelectItem value="ARCHIVED">Archivé</SelectItem>
          </SelectContent>
        </Select>

        <DocumentFormDialog
          mode="create"
          departmentId={departmentId}
          categories={categories}
          triggerLabel="Nouveau"
          triggerVariant="default"
        />
      </div>

      {!isLoading && sorted.length === 0 ? (
        <div className="rounded-xl border bg-white/70 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-emerald-200" />
            <div className="mt-4 text-sm font-medium text-slate-700">Aucun document</div>
            <div className="mt-1 text-sm text-slate-500">
              Ajoutez un document pour commencer à alimenter ce département.
            </div>
            <div className="mt-5">
              <DocumentFormDialog
                mode="create"
                departmentId={departmentId}
                categories={categories}
                triggerLabel="Nouveau document"
                triggerVariant="outline"
              />
            </div>
          </div>
        </div>
      ) : (
        <DataTable<DocumentResponse>
          data={sorted}
          rowKey={(d) => d.id}
          emptyLabel={isLoading ? "Chargement…" : "Aucun document."}
          columns={[
            {
              header: "Titre",
              render: (d) => <span className="font-medium">{d.title}</span>,
            },
            {
              header: "Référence",
              className: "w-[140px]",
              render: (d) => <span className="font-mono">{d.referenceCode}</span>,
            },
            {
              header: "Catégorie",
              className: "w-[180px]",
              render: (d) => (
                <span className="truncate">
                  {d.categoryName ??
                    (typeof d.categoryId === "number" ? categoriesById.get(d.categoryId) : null) ??
                    d.categoryId ??
                    "-"}
                </span>
              ),
            },
            {
              header: "Statut",
              className: "w-[140px]",
              render: (d) => <Badge variant={statusVariant(d.status)}>{d.status}</Badge>,
            },
            {
              header: "Date",
              className: "w-[140px]",
              render: (d) => d.documentDate,
            },
            {
              header: "Actions",
              className: "w-[220px]",
              render: (d) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Prévisualiser"
                    title="Prévisualiser"
                    className="transition-transform hover:scale-110"
                    onClick={() => {
                      setSelectedDocument(d);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Télécharger"
                    title="Télécharger"
                    className="transition-transform hover:scale-110"
                    onClick={() => window.open(buildDownloadUrl(d.id), "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Ouvrir dans un nouvel onglet"
                    title="Ouvrir"
                    className="transition-transform hover:scale-110"
                    onClick={() => window.open(buildOpenUrl(d.id), "_blank")}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>

                  <DocumentFormDialog
                    mode="edit"
                    document={d}
                    departmentId={departmentId}
                    categories={categories}
                    triggerLabel=""
                    triggerVariant="ghost"
                  />

                  <DocumentDeleteDialog document={d} />
                </div>
              ),
            },
          ]}
        />
      )}

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setSelectedDocument(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-hidden p-0">
          {/* Header avec titre */}
          <div className="flex items-center justify-between border-b p-6 pr-12">
            <DialogTitle className="text-xl font-semibold">
              {selectedDocument?.title?.trim()
                ? selectedDocument.title
                : selectedDocument?.referenceCode || "Document"}
            </DialogTitle>
          </div>

          {/* Contenu du document */}
          <div className="flex-1 overflow-auto p-6">
            {previewUrl && isPdf ? (
              <iframe
                src={previewUrl}
                className="bg-background h-[calc(90vh-140px)] w-full rounded-md border"
                title={selectedDocument?.title ?? "Document"}
              />
            ) : (
              <div className="flex h-[calc(90vh-140px)] flex-col items-center justify-center text-center">
                <FileText className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-600">Prévisualisation non disponible</p>
                <p className="mt-1 text-sm text-slate-500">
                  Le format de ce fichier ne permet pas un affichage dans le navigateur.
                </p>
                {selectedDocument?.id ? (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(buildDownloadUrl(selectedDocument.id), "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le fichier
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer avec boutons */}
          <div className="flex flex-row justify-end gap-3 border-t p-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Fermer
            </Button>
            {selectedDocument?.id ? (
              <Button
                variant="default"
                onClick={() => window.open(buildDownloadUrl(selectedDocument.id), "_blank")}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
