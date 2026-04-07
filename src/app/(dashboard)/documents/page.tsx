"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, Eye, FileText, HardDrive, Plus, XCircle } from "lucide-react";

import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentFormDialog } from "@/features/documents/components/DocumentFormDialog";
import { DocumentDeleteDialog } from "@/features/documents/components/DocumentDeleteDialog";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { buildDownloadUrl, buildPreviewUrl } from "@/shared/api/services/files";
import type { DocumentResponse } from "@/types/api/document";

function toNumberOrUndefined(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const sidebarDepartmentId = toNumberOrUndefined(searchParams.get("departmentId"));
  const sidebarCategoryId = toNumberOrUndefined(searchParams.get("categoryId"));
  const previewId = toNumberOrUndefined(searchParams.get("previewId"));
  const q = (searchParams.get("q") ?? "").trim();

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const categoriesQuery = useCategories({
    departmentId: sidebarDepartmentId,
    activeOnly: false,
  });

  const departmentsQuery = useDepartments();

  const documentsQuery = useDocuments({
    departmentId: sidebarDepartmentId,
    categoryId: sidebarCategoryId,
    activeOnly: false,
  });

  const data = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);

  useEffect(() => {
    setSearchQuery(q);
  }, [q]);

  useEffect(() => {
    if (typeof sidebarDepartmentId === "number") {
      setDepartmentFilter(String(sidebarDepartmentId));
    }
  }, [sidebarDepartmentId]);

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();

    return data.filter((d) => {
      if (departmentFilter !== "all" && String(d.departmentId ?? "") !== departmentFilter) {
        return false;
      }

      if (typeof sidebarCategoryId === "number" && d.categoryId !== sidebarCategoryId) {
        return false;
      }

      if (statusFilter !== "all" && d.status !== statusFilter) {
        return false;
      }

      if (needle) {
        const searchableText = [
          d.title,
          d.referenceCode,
          d.description ?? "",
          d.departmentName ?? "",
          d.categoryName ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!searchableText.includes(needle)) return false;
      }

      return true;
    });
  }, [data, departmentFilter, searchQuery, sidebarCategoryId, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [filtered]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState<DocumentResponse | null>(null);

  useEffect(() => {
    if (typeof previewId !== "number") return;
    const doc = data.find((d) => d.id === previewId);
    if (!doc) return;

    setSelected(doc);
    setPreviewOpen(true);
  }, [data, previewId]);

  const previewUrl = useMemo(() => {
    if (!selected?.id) return null;
    return buildPreviewUrl(selected.id);
  }, [selected?.id]);

  const isPdf = useMemo(() => {
    return (selected?.mimeType ?? "").toLowerCase() === "application/pdf";
  }, [selected?.mimeType]);

  const description = useMemo(() => {
    if (typeof sidebarDepartmentId === "number") {
      return `Documents du département #${sidebarDepartmentId}`;
    }
    return "Consultez et gérez l'ensemble des documents";
  }, [sidebarDepartmentId]);

  const kpis = useMemo(() => {
    const totalDocs = data.length;
    const totalStorage = data.reduce((acc, d) => acc + (d.fileSize ?? 0), 0);
    const activeDocs = data.filter((d) => d.active).length;
    const inactiveDocs = totalDocs - activeDocs;

    const mb = totalStorage / (1024 * 1024);
    const storageLabel = mb >= 1024 ? `${(mb / 1024).toFixed(2)} Go` : `${mb.toFixed(1)} Mo`;

    return {
      totalDocs,
      totalStorageLabel: storageLabel,
      activeDocs,
      inactiveDocs,
    };
  }, [data]);

  const statusLabel = (status: DocumentResponse["status"]) => {
    if (status === "DRAFT") return "Brouillon";
    if (status === "VALIDATED") return "Validé";
    if (status === "ARCHIVED") return "Archivé";
    return status;
  };

  const statusVariant = (status: DocumentResponse["status"]) => {
    if (status === "VALIDATED") return "default";
    if (status === "ARCHIVED") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={description}
        actions={
          typeof sidebarDepartmentId === "number" ? (
            <DocumentFormDialog
              mode="create"
              departmentId={sidebarDepartmentId}
              categories={categoriesQuery.data ?? []}
              triggerLabel="Nouveau document"
              triggerVariant="default"
            />
          ) : (
            <Button
              variant="default"
              disabled
              className="gap-2"
              title="Sélectionne un département dans la Sidebar"
            >
              <Plus className="h-4 w-4" />
              Nouveau document
            </Button>
          )
        }
      />

      <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 duration-300">
        <Breadcrumb items={[{ label: "Accueil", href: "/dashboard" }, { label: "Documents" }]} />
      </div>

      {documentsQuery.error ? (
        <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-lg border p-4 text-sm">
          Erreur lors du chargement des documents.
        </div>
      ) : null}

      <div className="stagger-children grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-600">Total documents</div>
                <div className="mt-1 text-3xl font-bold text-emerald-700">
                  {documentsQuery.isLoading ? "…" : kpis.totalDocs}
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-600">Stockage total</div>
                <div className="mt-1 text-3xl font-bold text-slate-900">
                  {documentsQuery.isLoading ? "…" : kpis.totalStorageLabel}
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200">
                <HardDrive className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-600">Documents actifs</div>
                <div className="mt-1 text-3xl font-bold text-emerald-700">
                  {documentsQuery.isLoading ? "…" : kpis.activeDocs}
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-600">Documents inactifs</div>
                <div className="mt-1 text-3xl font-bold text-slate-900">
                  {documentsQuery.isLoading ? "…" : kpis.inactiveDocs}
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 gap-4 duration-300 md:grid-cols-4">
        <div className="md:col-span-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, référence, description…"
          />
        </div>

        <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v ?? "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous les départements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {(departmentsQuery.data ?? []).map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="VALIDATED">Validé</SelectItem>
            <SelectItem value="ARCHIVED">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<DocumentResponse>
        data={sorted}
        rowKey={(d) => d.id}
        className="animate-in fade-in duration-300"
        emptyLabel={
          documentsQuery.isLoading
            ? "Chargement…"
            : searchQuery.trim()
              ? "Aucun résultat."
              : "Aucun document."
        }
        columns={[
          {
            header: "Titre",
            render: (d) => (
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900">{d.title}</div>
                <div className="text-muted-foreground truncate text-xs">{d.referenceCode}</div>
              </div>
            ),
          },
          {
            header: "Département",
            className: "w-[220px]",
            render: (d) => (
              <span className="truncate text-slate-700">{d.departmentName ?? "-"}</span>
            ),
          },
          {
            header: "Catégorie",
            className: "w-[200px]",
            render: (d) => <span className="truncate text-slate-700">{d.categoryName ?? "-"}</span>,
          },
          {
            header: "Statut",
            className: "w-[140px]",
            render: (d) => <Badge variant={statusVariant(d.status)}>{statusLabel(d.status)}</Badge>,
          },
          {
            header: "Date",
            className: "w-[140px]",
            render: (d) => <span className="text-slate-700">{d.documentDate}</span>,
          },
          {
            header: "Actions",
            className: "w-[220px]",
            render: (d) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="transition-transform hover:scale-110"
                  title="Prévisualiser"
                  aria-label="Prévisualiser"
                  onClick={() => {
                    setSelected(d);
                    setPreviewOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="transition-transform hover:scale-110"
                  title="Télécharger"
                  aria-label="Télécharger"
                  onClick={() => window.open(buildDownloadUrl(d.id), "_blank")}
                >
                  <Download className="h-4 w-4" />
                </Button>

                {typeof sidebarDepartmentId === "number" ? (
                  <DocumentFormDialog
                    mode="edit"
                    document={d}
                    departmentId={sidebarDepartmentId}
                    categories={categoriesQuery.data ?? []}
                    triggerLabel=""
                    triggerVariant="ghost"
                  />
                ) : null}

                <DocumentDeleteDialog document={d} />
              </div>
            ),
          },
        ]}
      />

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-hidden p-0">
          {/* Header avec titre */}
          <div className="flex items-center justify-between border-b p-6 pr-12">
            <DialogTitle className="text-xl font-semibold">
              {selected?.title?.trim() ? selected.title : selected?.referenceCode || "Document"}
            </DialogTitle>
          </div>

          {/* Contenu du document */}
          <div className="flex-1 overflow-auto p-6">
            {previewUrl && isPdf ? (
              <iframe
                src={previewUrl}
                className="bg-background h-[calc(90vh-140px)] w-full rounded-md border"
                title={selected?.title ?? "Document"}
              />
            ) : (
              <div className="flex h-[calc(90vh-140px)] flex-col items-center justify-center text-center">
                <FileText className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-600">Prévisualisation non disponible</p>
                <p className="mt-1 text-sm text-slate-500">
                  Le format de ce fichier ne permet pas un affichage dans le navigateur.
                </p>
                {selected?.id ? (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(buildDownloadUrl(selected.id), "_blank")}
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
            {selected?.id ? (
              <Button
                variant="default"
                onClick={() => window.open(buildDownloadUrl(selected.id), "_blank")}
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
