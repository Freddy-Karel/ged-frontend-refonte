"use client";

import { useMemo } from "react";
import { Tags } from "lucide-react";

import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import type { CategoryResponse } from "@/types/api/category";
import type { DocumentResponse } from "@/types/api/document";
import { CategoryDeleteDialog } from "@/features/categories/components/CategoryDeleteDialog";
import { CategoryUpsertDialog } from "@/features/categories/components/CategoryUpsertDialog";

type Props = {
  departmentId: number;
  categories: CategoryResponse[];
  documents: DocumentResponse[];
  isLoading?: boolean;
};

export function CategoryList({ departmentId, categories, documents, isLoading }: Props) {
  const docsCountByCategory = useMemo(() => {
    const map = new Map<number, number>();
    for (const doc of documents) {
      if (typeof doc.categoryId !== "number") continue;
      map.set(doc.categoryId, (map.get(doc.categoryId) ?? 0) + 1);
    }
    return map;
  }, [documents]);

  if (!isLoading && categories.length === 0) {
    return (
      <div className="rounded-xl border bg-white/70 p-8 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <Tags className="h-12 w-12 text-emerald-200" />
          <div className="mt-4 text-sm font-medium text-slate-700">Aucune catégorie</div>
          <div className="mt-1 text-sm text-slate-500">
            Créez votre première catégorie pour organiser vos documents.
          </div>
          <div className="mt-5">
            <CategoryUpsertDialog
              mode="create"
              initialDepartmentId={departmentId}
              triggerLabel="Nouvelle catégorie"
              triggerVariant="outline"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <CategoryUpsertDialog
          mode="create"
          initialDepartmentId={departmentId}
          triggerLabel="Nouvelle catégorie"
          triggerVariant="default"
        />
      </div>

      <DataTable<CategoryResponse>
        data={categories}
        rowKey={(c) => c.id}
        emptyLabel={isLoading ? "Chargement…" : "Aucune catégorie."}
        columns={[
          {
            header: "Nom",
            render: (c) => <span className="font-medium">{c.name}</span>,
          },
          {
            header: "Description",
            render: (c) => <span className="text-muted-foreground">{c.description ?? ""}</span>,
          },
          {
            header: "Actif",
            className: "w-[140px]",
            render: (c) => (
              <Badge variant={c.active ? "success" : "secondary"}>
                {c.active ? "Actif" : "Inactif"}
              </Badge>
            ),
          },
          {
            header: "Documents",
            className: "w-[140px]",
            render: (c) => <span className="font-mono">{docsCountByCategory.get(c.id) ?? 0}</span>,
          },
          {
            header: "Actions",
            className: "w-[260px]",
            render: (c) => (
              <div className="flex gap-2">
                <CategoryUpsertDialog
                  mode="edit"
                  category={c}
                  triggerLabel="Modifier"
                  triggerVariant="outline"
                />
                <CategoryDeleteDialog category={c} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
