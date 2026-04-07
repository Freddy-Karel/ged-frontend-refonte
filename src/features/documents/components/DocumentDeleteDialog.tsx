"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

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
import { useDeleteDocument } from "@/shared/api/hooks/useDocuments";
import type { DocumentResponse } from "@/types/api/document";

export function DocumentDeleteDialog({ document }: { document: DocumentResponse }) {
  const [open, setOpen] = useState(false);
  const mutation = useDeleteDocument();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" aria-label="Supprimer">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le document ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le document “{document.title}” sera supprimé.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={async (e) => {
              e.preventDefault();
              await mutation.mutateAsync(document.id);
              setOpen(false);
            }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
