"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { ApiError } from "@/types/api/error";
import type { DepartmentRequest, DepartmentResponse } from "@/types/api/department";
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
import { useCreateDepartment, useUpdateDepartment } from "@/shared/api/hooks/useDepartments";

const schema = z.object({
  name: z.string().trim().min(2, "Le nom est requis."),
  description: z.string().trim().optional(),
  active: z.enum(["true", "false"]).default("true"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  mode: "create" | "edit";
  department?: DepartmentResponse;
  triggerLabel: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

function toRequest(values: FormValues): DepartmentRequest {
  return {
    name: values.name.trim(),
    description: values.description?.trim() ? values.description.trim() : null,
    active: values.active === "true",
  };
}

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

export function DepartmentUpsertDialog({
  mode,
  department,
  triggerLabel,
  triggerVariant = "outline",
}: Props) {
  const [open, setOpen] = useState(false);

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const defaultValues = useMemo<FormValues>(() => {
    return {
      name: department?.name ?? "",
      description: department?.description ?? "",
      active: (department?.active ?? true) ? "true" : "false",
    };
  }, [department?.active, department?.description, department?.name]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  const onSubmit = async (values: FormValues) => {
    const data = toRequest(values);

    if (mode === "create") {
      await createMutation.mutateAsync(data);
      setOpen(false);
      return;
    }

    if (!department) return;
    await updateMutation.mutateAsync({ id: department.id, data });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={triggerVariant}>{triggerLabel}</Button>} />

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Créer un département" : `Modifier: ${department?.name ?? ""}`}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
            {formatError(error)}
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Direction générale" {...field} />
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
                    <Textarea placeholder="Optionnel" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
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
                      <SelectItem value="true">Actif</SelectItem>
                      <SelectItem value="false">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
