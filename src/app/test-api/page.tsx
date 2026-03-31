"use client";

import { useMemo, useState } from "react";
import type { ApiError } from "@/types/api/error";
import { DOCUMENT_STATUSES, type DocumentStatus } from "@/types/domain/document";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDepartments } from "@/shared/api/hooks/useDepartments";
import { useCreateDocumentWithUpload, useDocuments } from "@/shared/api/hooks/useDocuments";

function formatError(err: unknown): string {
  if (!err) return "";
  const e = err as Partial<ApiError>;
  if (typeof e.message === "string" && e.message) {
    return e.status ? `[${e.status}] ${e.message}` : e.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function toNumberOrUndefined(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export default function TestApiPage() {
  const [departmentIdInput, setDepartmentIdInput] = useState<string>("");
  const [categoryIdInput, setCategoryIdInput] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  const departmentId = useMemo(() => toNumberOrUndefined(departmentIdInput), [departmentIdInput]);
  const categoryId = useMemo(() => toNumberOrUndefined(categoryIdInput), [categoryIdInput]);

  const departmentsQuery = useDepartments();
  const categoriesQuery = useCategories({
    departmentId,
    activeOnly,
  });
  const documentsQuery = useDocuments({
    departmentId,
    categoryId,
    activeOnly,
  });

  const createDoc = useCreateDocumentWithUpload();

  const [title, setTitle] = useState("Document test API");
  const [description, setDescription] = useState("Créé depuis /test-api");
  const [status, setStatus] = useState<DocumentStatus>("DRAFT");
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [departmentIdForCreate, setDepartmentIdForCreate] = useState<string>("");
  const [categoryIdForCreate, setCategoryIdForCreate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const createDisabled =
    createDoc.isPending ||
    !file ||
    !toNumberOrUndefined(departmentIdForCreate) ||
    !toNumberOrUndefined(categoryIdForCreate) ||
    !title.trim() ||
    !documentDate;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Smoke test API</h1>
        <p className="text-muted-foreground text-sm">
          Base URL:{" "}
          <code className="font-mono">
            {process.env.NEXT_PUBLIC_API_BASE_URL ?? "(fallback: http://localhost:8080/api)"}
          </code>
        </p>
      </div>

      <section className="bg-card space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-medium">Filtres</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <div className="text-sm font-medium">departmentId (optionnel)</div>
            <input
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={departmentIdInput}
              onChange={(e) => setDepartmentIdInput(e.target.value)}
              placeholder="ex: 1"
              inputMode="numeric"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium">categoryId (optionnel)</div>
            <input
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={categoryIdInput}
              onChange={(e) => setCategoryIdInput(e.target.value)}
              placeholder="ex: 2"
              inputMode="numeric"
            />
          </label>

          <label className="flex items-end gap-2">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">activeOnly</span>
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bg-card space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-medium">Départements</h2>
          {departmentsQuery.isLoading ? <div className="text-sm">Chargement…</div> : null}
          {departmentsQuery.error ? (
            <div className="text-destructive text-sm">{formatError(departmentsQuery.error)}</div>
          ) : null}
          <ul className="space-y-1 text-sm">
            {departmentsQuery.data?.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2">
                <span className="font-medium">#{d.id}</span>
                <span className="flex-1 truncate">{d.name}</span>
                <span className="text-muted-foreground">{d.active ? "active" : "inactive"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-medium">Catégories</h2>
          {categoriesQuery.isLoading ? <div className="text-sm">Chargement…</div> : null}
          {categoriesQuery.error ? (
            <div className="text-destructive text-sm">{formatError(categoriesQuery.error)}</div>
          ) : null}
          <ul className="space-y-1 text-sm">
            {categoriesQuery.data?.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span className="font-medium">#{c.id}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground">dep: {c.departmentId ?? "-"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-medium">Documents</h2>
          {documentsQuery.isLoading ? <div className="text-sm">Chargement…</div> : null}
          {documentsQuery.error ? (
            <div className="text-destructive text-sm">{formatError(documentsQuery.error)}</div>
          ) : null}
          <ul className="space-y-2 text-sm">
            {documentsQuery.data?.map((doc) => (
              <li key={doc.id} className="rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium">
                    #{doc.id} — {doc.title}
                  </div>
                  <div className="text-muted-foreground">{doc.status}</div>
                </div>
                <div className="text-muted-foreground truncate">ref: {doc.referenceCode}</div>
                <div className="text-muted-foreground truncate">
                  dep: {doc.departmentId ?? "-"} | cat: {doc.categoryId ?? "-"}
                </div>
                <div className="mt-1 flex gap-3">
                  {doc.openUrl ? (
                    <a
                      className="text-primary underline"
                      href={doc.openUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      open
                    </a>
                  ) : null}
                  {doc.downloadUrl ? (
                    <a
                      className="text-primary underline"
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      download
                    </a>
                  ) : null}
                  {doc.externalUrl ? (
                    <a
                      className="text-primary underline"
                      href={doc.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      external
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-card space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-medium">Créer un document de test (upload)</h2>

        {createDoc.error ? (
          <div className="text-destructive text-sm">{formatError(createDoc.error)}</div>
        ) : null}
        {createDoc.data ? (
          <div className="text-sm text-green-700">
            Créé: #{createDoc.data.id} — {createDoc.data.title}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm font-medium">Titre</div>
            <input
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium">Date document (YYYY-MM-DD)</div>
            <input
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              placeholder="2026-03-26"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium">Department ID</div>
            <input
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={departmentIdForCreate}
              onChange={(e) => setDepartmentIdForCreate(e.target.value)}
              placeholder="ex: 1"
              inputMode="numeric"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium">Category ID</div>
            <input
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={categoryIdForCreate}
              onChange={(e) => setCategoryIdForCreate(e.target.value)}
              placeholder="ex: 2"
              inputMode="numeric"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <div className="text-sm font-medium">Description</div>
            <input
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium">Status</div>
            <select
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as DocumentStatus)}
            >
              {DOCUMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium">Fichier</div>
            <input
              className="w-full text-sm"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <button
          type="button"
          className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          disabled={createDisabled}
          onClick={async () => {
            const depId = toNumberOrUndefined(departmentIdForCreate);
            const catId = toNumberOrUndefined(categoryIdForCreate);
            if (!file || !depId || !catId) return;

            await createDoc.mutateAsync({
              title,
              description,
              status,
              documentDate,
              departmentId: depId,
              categoryId: catId,
              active: true,
              file,
            });

            await documentsQuery.refetch();
          }}
        >
          {createDoc.isPending ? "Création…" : "Créer (upload)"}
        </button>
      </section>

      <section className="bg-card space-y-2 rounded-lg border p-4">
        <h2 className="text-lg font-medium">Vérification encodage UTF-8 (raw JSON)</h2>
        <div className="text-muted-foreground mb-2 text-sm">
          Vérifie que &quot;Direction générale&quot; s&apos;affiche correctement ci-dessous :
        </div>
        <details>
          <summary className="text-primary cursor-pointer text-sm font-medium">
            Afficher les données brutes (departments)
          </summary>
          <pre className="bg-muted mt-2 max-h-64 overflow-auto rounded-md p-3 text-xs">
            {JSON.stringify(departmentsQuery.data, null, 2)}
          </pre>
        </details>
      </section>

      <section className="bg-card space-y-2 rounded-lg border p-4">
        <h2 className="text-lg font-medium">Notes</h2>
        <div className="text-muted-foreground text-sm">
          - Si tu n&apos;as pas défini <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code>,
          le client utilise le fallback <code className="font-mono">http://localhost:8080/api</code>
          .
        </div>
      </section>
    </div>
  );
}
