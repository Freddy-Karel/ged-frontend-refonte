"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText } from "lucide-react";

interface DepartmentRank {
  id: number;
  name: string;
  documentCount: number;
}

interface TopDepartmentsProps {
  departments: DepartmentRank[];
  maxDocuments: number;
  loading?: boolean;
}

export function TopDepartments({ departments, maxDocuments, loading }: TopDepartmentsProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Top départements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="bg-muted h-4 w-3/4 rounded" />
              <div className="bg-muted h-2 w-full rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Top départements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-12 w-12 text-slate-300" />
              <div className="mt-3 text-sm text-slate-600">Aucun document pour le moment</div>
              <div className="mt-1 text-xs text-slate-500">Commencez par importer un document</div>
            </div>
          ) : (
            departments.map((dept, index) => (
              <Link key={dept.id} href={`/departments/${dept.id}`} className="group block">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-5 font-bold">{index + 1}.</span>
                      <span className="max-w-[160px] truncate font-medium">{dept.name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">{dept.documentCount} docs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={(dept.documentCount / maxDocuments) * 100}
                      className="h-2 flex-1"
                    />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
