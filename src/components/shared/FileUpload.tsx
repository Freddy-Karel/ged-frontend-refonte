"use client";

import { useId } from "react";

type Props = {
  label?: string;
  accept?: string;
  disabled?: boolean;
  onFileSelected: (file: File | null) => void;
};

export function FileUpload({ label = "Fichier", accept, disabled, onFileSelected }: Props) {
  const id = useId();

  return (
    <label className="space-y-1">
      <div className="text-sm font-medium">{label}</div>
      <input
        id={id}
        className="w-full text-sm"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
