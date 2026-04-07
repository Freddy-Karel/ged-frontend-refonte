import type React from "react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  header: string;
  className?: string;
  cellClassName?: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  rowKey: (row: T) => string | number;
  emptyLabel?: string;
  className?: string;
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  emptyLabel = "Aucune donnée.",
  className,
}: Props<T>) {
  return (
    <div className={cn("bg-card overflow-auto rounded-lg border", className)}>
      <table className="min-w-full text-sm">
        <thead className="bg-muted/60 sticky top-0 backdrop-blur">
          <tr className="border-b">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn("px-4 py-3 text-left font-medium text-slate-700", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="text-muted-foreground px-4 py-6" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-muted/40 border-b last:border-b-0">
                {columns.map((col, idx) => (
                  <td key={idx} className={cn("px-4 py-3 align-top", col.cellClassName)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
