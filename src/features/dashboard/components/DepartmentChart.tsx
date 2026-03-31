"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DepartmentData {
  id: number;
  name: string;
  documentCount: number;
}

interface DepartmentChartProps {
  data: DepartmentData[];
  loading?: boolean;
}

const COLORS = ["#10b981", "#059669", "#047857", "#065f46", "#34d399", "#6ee7b7"];

export function DepartmentChart({ data, loading }: DepartmentChartProps) {
  const sortedData = [...data].sort((a, b) => b.documentCount - a.documentCount);
  const total = sortedData.reduce((acc, item) => acc + item.documentCount, 0);

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Documents par département</CardTitle>
        </CardHeader>
        <CardContent className="bg-muted h-64 animate-pulse rounded-lg" />
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Documents par département</CardTitle>
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
        <CardTitle className="text-lg">Documents par département</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={sortedData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: string) =>
                value.length > 15 ? value.slice(0, 15) + "..." : value
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`${value ?? 0} documents`, ""]}
            />
            <Bar dataKey="documentCount" radius={[0, 4, 4, 0]} cursor="pointer">
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="text-muted-foreground mt-2 text-center text-xs">
          Cliquez sur une barre pour accéder au département
        </div>
      </CardContent>
    </Card>
  );
}
