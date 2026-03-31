"use client";

import { useState } from "react";

import type { ApiError } from "@/types/api/error";
import type { DepartmentResponse } from "@/types/api/department";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteDepartment } from "@/shared/api/hooks/useDepartments";

function formatError(err: unknown): string {
  if (!err) return "";
  const e = err as Partial<ApiError>;
  if (typeof e.message === "string" && e.message) return e.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function DepartmentDeleteDialog({ department }: { department: DepartmentResponse }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeleteDepartment();

  const onDelete = async () => {
    await mutation.mutateAsync(department.id);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive">Supprimer</Button>} />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le département</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le backend refusera la suppression si des catégories ou
            des documents sont liés.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.error ? (
          <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
            {formatError(mutation.error)}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button variant="destructive" onClick={onDelete} disabled={mutation.isPending}>
                {mutation.isPending ? "Suppression…" : "Confirmer"}
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
