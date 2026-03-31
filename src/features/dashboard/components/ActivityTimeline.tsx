"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/date";
import { Building2, Tags, FileText } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "department" | "category" | "document";
  title: string;
  departmentName?: string | null;
  status?: string;
  createdAt: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const activityConfig = {
  department: {
    icon: Building2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    label: "Département créé",
  },
  category: {
    icon: Tags,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    label: "Catégorie créée",
  },
  document: {
    icon: FileText,
    color: "text-emerald-700",
    bgColor: "bg-emerald-200",
    label: "Document ajouté",
  },
};

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse gap-3">
              <div className="bg-muted h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative max-h-80 overflow-y-auto pr-2">
          <div className="absolute top-1 bottom-1 left-4 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Aucune activité récente
              </p>
            ) : (
              activities.map((activity) => {
                const config = activityConfig[activity.type];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="relative flex gap-3 rounded-lg p-2 pl-0 transition-colors hover:bg-white/60"
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`ml-0.5 flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor} ring-1 ring-slate-200`}
                      >
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[11px]">
                              {config.label}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(activity.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                            {activity.title}
                          </p>
                        </div>
                      </div>

                      <div className="mt-1 space-y-0.5">
                        {activity.departmentName ? (
                          <p className="text-muted-foreground truncate text-xs">
                            Département:{" "}
                            <span className="text-slate-600">{activity.departmentName}</span>
                          </p>
                        ) : null}
                        {activity.status ? (
                          <p className="text-muted-foreground truncate text-xs">
                            Statut: <span className="text-slate-600">{activity.status}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
