"use client";

import { useMemo } from "react";
import type { DocumentResponse } from "@/types/api/document";
import { buildPreviewUrl } from "@/shared/api/services/files";

type Props = {
  document: DocumentResponse;
};

export function DocumentPreview({ document }: Props) {
  const previewUrl = useMemo(() => buildPreviewUrl(document.id), [document.id]);
  const isPdf = (document.mimeType ?? "").toLowerCase() === "application/pdf";

  if (!document.id) return null;

  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-medium">Prévisualisation</div>
        <div className="text-muted-foreground truncate text-xs">
          {document.originalFileName ?? document.storedFileName ?? ""}
        </div>
      </div>

      <div className="p-4">
        {isPdf ? (
          <iframe
            title="Document preview"
            src={previewUrl}
            className="bg-background h-[70vh] w-full rounded-md border"
          />
        ) : (
          <div className="text-muted-foreground text-sm">
            Prévisualisation non disponible pour ce type de fichier.
          </div>
        )}
      </div>
    </div>
  );
}
