"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FileUp, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type FileDropzoneProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
};

export function FileDropzone({
  value,
  onChange,
  disabled,
  accept,
  maxSize,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!(value instanceof File)) return null;
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    disabled,
    accept,
    maxSize,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const inputProps = getInputProps();

  const hasFile = !!value;

  return (
    <div
      {...getRootProps({
        onClick: () => {
          if (!disabled) open();
        },
      })}
      className={cn(
        "cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        hasFile && "bg-muted/30 border-solid",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <input {...inputProps} ref={inputRef} className="hidden" />
      {hasFile ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{value.name}</p>
              <p className="text-muted-foreground text-xs">
                {(value.size / 1024).toFixed(1)} KB • {value.type || "type inconnu"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={disabled}
              aria-label="Changer de fichier"
              title="Changer de fichier"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl &&
          ((value.type ?? "").startsWith("image/") ||
            (value.type ?? "").toLowerCase() === "application/pdf") ? (
            <div className="bg-muted/20 rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium">Aperçu local</p>
              {(value.type ?? "").startsWith("image/") ? (
                <div className="max-h-[200px] overflow-auto rounded-lg bg-white shadow-sm">
                  <div className="relative h-[180px] w-full">
                    <Image
                      src={previewUrl}
                      alt="Aperçu"
                      fill
                      unoptimized
                      sizes="100vw"
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="max-h-[200px] overflow-auto rounded-lg border bg-white">
                  <iframe
                    src={previewUrl}
                    className="bg-background h-[180px] w-full"
                    title="Aperçu PDF"
                  />
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={disabled}
            >
              Changer de fichier
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <FileUp className="text-muted-foreground h-8 w-8" />
          <p className="text-sm font-medium">
            {isDragActive ? "Déposez le fichier ici" : "Glissez-déposez un fichier ou cliquez"}
          </p>
          <p className="text-muted-foreground text-xs">PDF, images, documents supportés</p>
        </div>
      )}
    </div>
  );
}
