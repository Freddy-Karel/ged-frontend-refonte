"use client";

import { useMemo } from "react";
import { Building2, Tags, FileText, HardDrive } from "lucide-react";

import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDocuments } from "@/shared/api/hooks/useDocuments";

import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { StatusChart } from "@/features/dashboard/components/StatusChart";
import { DepartmentChart } from "@/features/dashboard/components/DepartmentChart";
import { ActivityTimeline } from "@/features/dashboard/components/ActivityTimeline";
import { TopDepartments } from "@/features/dashboard/components/TopDepartments";
import { RecentDocumentsTable } from "@/features/dashboard/components/RecentDocumentsTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

function formatStorageSize(bytes: number): string {
  if (bytes === 0) return "0 Mo";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} Mo`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} Go`;
}

export default function DashboardPage() {
  const departmentsQuery = useDepartments();
  const categoriesQuery = useCategories({ activeOnly: false });
  const documentsQuery = useDocuments({ activeOnly: false });

  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const documents = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);

  const isLoading =
    departmentsQuery.isLoading || categoriesQuery.isLoading || documentsQuery.isLoading;

  // KPI calculations
  const kpis = useMemo(() => {
    const totalDepartments = departments.length;
    const totalCategories = categories.length;
    const totalDocuments = documents.length;
    const totalStorage = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);

    const activeCategories = categories.filter((c) => c.active).length;
    const inactiveCategories = totalCategories - activeCategories;

    return {
      totalDepartments,
      totalCategories,
      totalDocuments,
      totalStorage,
      activeCategories,
      inactiveCategories,
    };
  }, [departments, categories, documents]);

  // Documents by status for chart
  const statusData = useMemo(() => {
    const byStatus = { DRAFT: 0, VALIDATED: 0, ARCHIVED: 0 };

    documents.forEach((doc) => {
      if (doc.status === "DRAFT") byStatus.DRAFT++;
      else if (doc.status === "VALIDATED") byStatus.VALIDATED++;
      else if (doc.status === "ARCHIVED") byStatus.ARCHIVED++;
    });

    return [
      { status: "DRAFT" as const, count: byStatus.DRAFT },
      { status: "VALIDATED" as const, count: byStatus.VALIDATED },
      { status: "ARCHIVED" as const, count: byStatus.ARCHIVED },
    ];
  }, [documents]);

  // Documents by department for chart
  const departmentData = useMemo(() => {
    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      documentCount: documents.filter((d) => d.departmentId === dept.id).length,
    }));
  }, [departments, documents]);

  // Top 5 departments by document count
  const topDepartments = useMemo(() => {
    return [...departmentData].sort((a, b) => b.documentCount - a.documentCount).slice(0, 5);
  }, [departmentData]);

  const maxDocuments = useMemo(() => {
    return Math.max(...departmentData.map((d) => d.documentCount), 1);
  }, [departmentData]);

  // Recent activity
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: "department" | "category" | "document";
      title: string;
      departmentName?: string | null;
      status?: string;
      createdAt: string;
    }> = [];

    departments.forEach((dept) => {
      activities.push({
        id: `dept-${dept.id}`,
        type: "department",
        title: dept.name,
        createdAt: dept.createdAt,
      });
    });

    categories.forEach((cat) => {
      const dept = departments.find((d) => d.id === cat.departmentId);
      activities.push({
        id: `cat-${cat.id}`,
        type: "category",
        title: cat.name,
        departmentName: dept?.name,
        createdAt: cat.createdAt,
      });
    });

    documents.forEach((doc) => {
      activities.push({
        id: `doc-${doc.id}`,
        type: "document",
        title: doc.title,
        departmentName: doc.departmentName,
        status: doc.status,
        createdAt: doc.createdAt,
      });
    });

    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [departments, categories, documents]);

  // Recent documents
  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [documents]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la Gestion Électronique des Documents"
      />

      <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 duration-300">
        <Breadcrumb
          items={[{ label: "Accueil", href: "/dashboard" }, { label: "Tableau de bord" }]}
        />
      </div>

      {/* KPI Cards */}
      <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Départements"
          value={isLoading ? "..." : kpis.totalDepartments}
          icon={Building2}
          color="emerald"
          href="/departments"
          subtitle={isLoading ? "" : `${kpis.totalDepartments} espaces documentaires`}
        />
        <KpiCard
          title="Catégories"
          value={isLoading ? "..." : kpis.totalCategories}
          icon={Tags}
          color="green"
          href="/departments"
          subtitle={
            isLoading
              ? ""
              : `${kpis.activeCategories} actives, ${kpis.inactiveCategories} inactives`
          }
        />
        <KpiCard
          title="Documents"
          value={isLoading ? "..." : kpis.totalDocuments}
          icon={FileText}
          color="purple"
          href="/documents"
          subtitle={isLoading ? "" : "Fichiers gérés dans la GED"}
        />
        <KpiCard
          title="Stockage"
          value={isLoading ? "..." : formatStorageSize(kpis.totalStorage)}
          icon={HardDrive}
          color="orange"
          subtitle={isLoading ? "" : "Volume total des fichiers"}
        />
      </div>

      {/* Charts Row */}
      <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 gap-6 duration-300 lg:grid-cols-2">
        <StatusChart data={statusData} loading={isLoading} />
        <DepartmentChart data={departmentData} loading={isLoading} />
      </div>

      {/* Activity + Top Departments */}
      <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 gap-6 duration-300 lg:grid-cols-2">
        <ActivityTimeline activities={recentActivities} loading={isLoading} />
        <TopDepartments
          departments={topDepartments}
          maxDocuments={maxDocuments}
          loading={isLoading}
        />
      </div>

      {/* Recent Documents */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <RecentDocumentsTable documents={recentDocuments} loading={isLoading} />
      </div>
    </div>
  );
}
