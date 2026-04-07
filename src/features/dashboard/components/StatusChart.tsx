"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DocumentStatus } from "@/types/domain/document";

interface StatusData {
  status: DocumentStatus;
  count: number;
}

interface StatusChartProps {
  data: StatusData[];
  loading?: boolean;
}

const statusConfig = {
  DRAFT: { color: "#f59e0b", label: "Brouillons" },
  VALIDATED: { color: "#22c55e", label: "Validés" },
  ARCHIVED: { color: "#6b7280", label: "Archivés" },
};

export function StatusChart({ data, loading }: StatusChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name: statusConfig[item.status].label,
    color: statusConfig[item.status].color,
  }));

  const total = data.reduce((acc, item) => acc + item.count, 0);

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Documents par statut</CardTitle>
        </CardHeader>
        <CardContent className="bg-muted h-64 animate-pulse rounded-lg" />
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Documents par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-12 w-12 text-slate-300" />
            <div className="mt-3 text-sm text-slate-600">Aucun document pour le moment</div>
            <div className="mt-1 text-xs text-slate-500">Commencez par importer un document</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Documents par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={256}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`${value ?? 0} documents`, ""]}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-muted-foreground mt-2 text-center text-sm">
          Total: {total} documents
        </div>
      </CardContent>
    </Card>
  );
}
