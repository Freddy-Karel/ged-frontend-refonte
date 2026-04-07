"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { DepartmentCard } from "@/features/departments/components/DepartmentCard";
import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { DepartmentUpsertDialog } from "@/features/departments/components/DepartmentUpsertDialog";

export default function DepartmentsPage() {
  const departmentsQuery = useDepartments();
  const departments = departmentsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Départements"
        description="Gérez les espaces documentaires de l'organisation"
        actions={
          <DepartmentUpsertDialog
            mode="create"
            triggerLabel="Nouveau département"
            triggerVariant="default"
          />
        }
      />

      <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 duration-300">
        <Breadcrumb items={[{ label: "Accueil", href: "/dashboard" }, { label: "Départements" }]} />
      </div>

      {departmentsQuery.error ? (
        <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-lg border p-4 text-sm">
          Erreur lors du chargement des départements.
        </div>
      ) : null}

      {departmentsQuery.isLoading ? (
        <div className="animate-in fade-in grid grid-cols-1 gap-4 duration-300 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-[320px] animate-pulse rounded-xl border bg-white/70" />
          ))}
        </div>
      ) : departments.length > 0 ? (
        <div className="stagger-children grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => (
            <DepartmentCard key={d.id} department={d} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground animate-in fade-in rounded-xl border border-dashed bg-white/50 p-6 text-sm duration-300">
          Aucun département.
        </div>
      )}
    </div>
  );
}
