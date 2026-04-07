/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Lock, Pencil, Plus } from "lucide-react";
import type { AxiosProgressEvent } from "axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/shared/FileDropzone";
import {
  useCreateDocumentWithUpload,
  useUpdateDocument,
  useUpdateDocumentWithUpload,
} from "@/shared/api/hooks/useDocuments";
import type { CategoryResponse } from "@/types/api/category";
import type { DocumentResponse } from "@/types/api/document";
import type { DocumentStatus } from "@/types/domain/document";

type Props =
  | {
      mode: "create";
      departmentId: number;
      departmentName?: string;
      categories: CategoryResponse[];
      triggerLabel?: string;
      triggerVariant?: React.ComponentProps<typeof Button>["variant"];
    }
  | {
      mode: "edit";
      document: DocumentResponse;
      departmentId: number;
      departmentName?: string;
      categories: CategoryResponse[];
      triggerLabel?: string;
      triggerVariant?: React.ComponentProps<typeof Button>["variant"];
    };

const StatusValues: DocumentStatus[] = ["DRAFT", "VALIDATED", "ARCHIVED"];

const schema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "VALIDATED", "ARCHIVED"]),
  documentDate: z.string().min(1, "Date requise"),
  categoryId: z.number().int().positive("Catégorie requise"),
  file: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof schema>;

export function DocumentFormDialog(props: Props) {
  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const departmentName = props.departmentName ?? `Département ${props.departmentId}`;

  const onUploadProgress = useMemo(
    () => (e: AxiosProgressEvent) => {
      const percent = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
      setUploadProgress(percent);
    },
    []
  );

  const createMutation = useCreateDocumentWithUpload({ onUploadProgress });
  const updateMutation = useUpdateDocument();
  const updateWithUploadMutation = useUpdateDocumentWithUpload({ onUploadProgress });

  const isEdit = props.mode === "edit";
  const defaultValues: FormValues = useMemo(() => {
    if (props.mode === "edit") {
      return {
        title: props.document.title,
        description: props.document.description ?? null,
        status: props.document.status,
        documentDate: props.document.documentDate,
        categoryId: props.document.categoryId ?? 0,
        file: undefined,
      };
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    return {
      title: "",
      description: null,
      status: "DRAFT",
      documentDate: `${yyyy}-${mm}-${dd}`,
      categoryId: 0,
      file: undefined,
    };
  }, [props]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      // Delay state update to avoid cascading renders
      const timeoutId = setTimeout(() => setUploadProgress(0), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, defaultValues, form]);

  const isPending =
    createMutation.isPending || updateMutation.isPending || updateWithUploadMutation.isPending;

  const triggerLabel = props.triggerLabel ?? (isEdit ? "Modifier" : "Nouveau document");
  const TriggerIcon = isEdit ? Pencil : Plus;
  const iconOnly = triggerLabel.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          iconOnly ? (
            <Button
              variant={props.triggerVariant ?? "ghost"}
              size="sm"
              aria-label={isEdit ? "Modifier" : "Créer"}
            >
              <TriggerIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant={props.triggerVariant ?? (isEdit ? "outline" : "default")}>
              <TriggerIcon className="mr-2 h-4 w-4" />
              {triggerLabel}
            </Button>
          )
        }
      />

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier un document" : "Nouveau document"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              if (!values.categoryId) {
                form.setError("categoryId", { message: "Catégorie requise" });
                return;
              }

              if (!isEdit) {
                if (!(values.file instanceof File)) {
                  form.setError("file", { message: "Fichier requis" });
                  return;
                }

                await createMutation.mutateAsync({
                  title: values.title,
                  description: values.description ?? null,
                  status: values.status,
                  documentDate: values.documentDate,
                  active: true,
                  categoryId: values.categoryId,
                  departmentId: props.departmentId,
                  file: values.file,
                });

                setOpen(false);
                return;
              }

              const doc = props.document;

              if (values.file instanceof File) {
                await updateWithUploadMutation.mutateAsync({
                  id: doc.id,
                  data: {
                    title: values.title,
                    description: values.description ?? null,
                    status: values.status,
                    documentDate: values.documentDate,
                    active: doc.active ?? true,
                    categoryId: values.categoryId,
                    departmentId: props.departmentId,
                    file: values.file,
                  },
                });
              } else {
                await updateMutation.mutateAsync({
                  id: doc.id,
                  data: {
                    title: values.title,
                    description: values.description ?? null,
                    status: values.status,
                    documentDate: values.documentDate,
                    active: doc.active ?? true,
                    categoryId: values.categoryId,
                    departmentId: props.departmentId,
                  },
                });
              }

              setOpen(false);
            })}
          >
            {/* Département verrouillé */}
            <div className="bg-muted/30 rounded-lg border p-3">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4" />
                <span>Département verrouillé :</span>
                <span className="text-foreground font-medium">{departmentName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      value={String(field.value || "")}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {props.categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {StatusValues.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File upload avec drag & drop */}
            <Controller
              name="file"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fichier {isEdit ? "(optionnel)" : ""}</FormLabel>
                  <FormControl>
                    <FileDropzone
                      value={field.value}
                      onChange={(file) => field.onChange(file)}
                      disabled={isPending}
                      accept={{
                        "application/pdf": [".pdf"],
                        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
                        "application/msword": [".doc"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
                          ".docx",
                        ],
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Barre de progression */}
            {isPending && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs">Upload en cours...</div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-muted-foreground text-right text-xs">{uploadProgress}%</div>
              </div>
            )}

            {createMutation.error || updateMutation.error || updateWithUploadMutation.error ? (
              <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
                Une erreur est survenue.
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEdit ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
