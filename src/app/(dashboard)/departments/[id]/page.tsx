"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { CheckCircle, FileClock, FileText, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { DepartmentUpsertDialog } from "@/features/departments/components/DepartmentUpsertDialog";
import { CategoryUpsertDialog } from "@/features/categories/components/CategoryUpsertDialog";
import { CategoryList } from "@/features/categories/components/CategoryList";
import { DocumentList } from "@/features/documents/components/DocumentList";
import { DocumentFormDialog } from "@/features/documents/components/DocumentFormDialog";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDocuments } from "@/shared/api/hooks/useDocuments";
import { useDepartment } from "@/shared/api/hooks/useDepartments";
import { revealClass, useScrollReveal } from "@/lib/animations";

function toNumberOrNull(value: string | string[] | undefined): number | null {
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export default function DepartmentDetailPage() {
  const params = useParams<{ id: string }>();
  const departmentId = toNumberOrNull(params?.id);

  const dashboardReveal = useScrollReveal(0.15);
  const tabsReveal = useScrollReveal(0.15);

  const departmentQuery = useDepartment(departmentId ?? undefined);
  const categoriesQuery = useCategories({
    departmentId: departmentId ?? undefined,
    activeOnly: false,
  });
  const documentsQuery = useDocuments({
    departmentId: departmentId ?? undefined,
    activeOnly: false,
  });

  const department = departmentQuery.data;
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const documents = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);

  const byStatus = useMemo(() => {
    return documents.reduce(
      (acc, d) => {
        if (d.status === "DRAFT") acc.DRAFT += 1;
        if (d.status === "VALIDATED") acc.VALIDATED += 1;
        if (d.status === "ARCHIVED") acc.ARCHIVED += 1;
        return acc;
      },
      { DRAFT: 0, VALIDATED: 0, ARCHIVED: 0 }
    );
  }, [documents]);

  const title = useMemo(() => {
    return department?.name ?? (departmentQuery.isLoading ? "Chargement…" : "Département");
  }, [department?.name, departmentQuery.isLoading]);

  if (departmentId === null) {
    notFound();
  }

  if (departmentQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Départements"
          description="Gérez les catégories et documents de ce département"
        />

        <div className="mt-4">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/dashboard" },
              { label: "Départements", href: "/departments" },
              { label: "Erreur" },
            ]}
          />
        </div>

        <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-lg border p-4 text-sm">
          Impossible de charger le département.
        </div>
      </div>
    );
  }

  if (!department && !departmentQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Départements"
          description="Gérez les catégories et documents de ce département"
        />

        <div className="mt-4">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/dashboard" },
              { label: "Départements", href: "/departments" },
              { label: "Introuvable" },
            ]}
          />
        </div>

        <div className="bg-card text-muted-foreground rounded-lg border p-6 text-sm">
          Département introuvable.
          <div className="mt-3">
            <Link href="/departments">
              <Button variant="outline">Retour</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={<span className="font-heading text-3xl font-bold">{title}</span>}
        description="Gérez les catégories et documents de ce département"
        actions={
          <>
            {department ? (
              <DepartmentUpsertDialog
                mode="edit"
                department={department}
                triggerLabel="Modifier"
                triggerVariant="outline"
              />
            ) : null}

            <CategoryUpsertDialog
              mode="create"
              initialDepartmentId={departmentId ?? undefined}
              triggerLabel="Nouvelle catégorie"
              triggerVariant="default"
            />

            <DocumentFormDialog
              mode="create"
              departmentId={departmentId ?? 0}
              departmentName={department?.name}
              categories={categories}
              triggerLabel="Nouveau document"
              triggerVariant="default"
            />

            {department ? (
              <Badge variant={department.active ? "success" : "secondary"}>
                {department.active ? "Actif" : "Inactif"}
              </Badge>
            ) : null}
          </>
        }
      />

      <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 duration-300">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/dashboard" },
            { label: "Départements", href: "/departments" },
            { label: title },
          ]}
        />
      </div>

      <div id={dashboardReveal.id} className={revealClass(dashboardReveal.inView)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Catégories" value={categories.length} icon={Tags} color="emerald" />
          <KpiCard title="Documents" value={documents.length} icon={FileText} color="emerald" />
          <KpiCard title="Brouillons" value={byStatus.DRAFT} icon={FileClock} color="amber" />
          <KpiCard
            title="Validés / Archivés"
            value={`${byStatus.VALIDATED} / ${byStatus.ARCHIVED}`}
            icon={CheckCircle}
            color="emerald"
          />
        </div>
      </div>

      <div id={tabsReveal.id} className={revealClass(tabsReveal.inView)}>
        <div className="rounded-xl border bg-white/70 p-4 backdrop-blur-xl">
          <Tabs defaultValue="categories" className="w-full space-y-4">
            <TabsList className="bg-muted/50 rounded-lg p-1">
              <TabsTrigger value="categories" className="rounded-md">
                <Tags className="mr-2 h-4 w-4" />
                Catégories
                <Badge variant="secondary" className="ml-2">
                  {categories.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-md">
                <FileText className="mr-2 h-4 w-4" />
                Documents
                <Badge variant="secondary" className="ml-2">
                  {documents.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="categories"
              className="animate-in fade-in-50 slide-in-from-top-5 duration-300"
            >
              <CategoryList
                departmentId={departmentId ?? 0}
                categories={categories}
                documents={documents}
                isLoading={categoriesQuery.isLoading || documentsQuery.isLoading}
              />
            </TabsContent>

            <TabsContent
              value="documents"
              className="animate-in fade-in-50 slide-in-from-top-5 duration-300"
            >
              <DocumentList
                departmentId={departmentId ?? 0}
                categories={categories}
                documents={documents}
                isLoading={documentsQuery.isLoading || categoriesQuery.isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
