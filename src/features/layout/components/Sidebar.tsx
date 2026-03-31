"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Tags,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/sidebarStore";
import { useCategories } from "@/shared/api/hooks/useCategories";
import { useDepartments } from "@/shared/api/hooks/useDepartments";

const navigation = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    href: "/departments",
    label: "Départements",
    icon: Building2,
    description: "Espaces documentaires",
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderOpen,
    description: "Consultation et gestion",
  },
] as const;

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isCollapsed, toggle } = useSidebarStore();

  const currentDepartmentId = searchParams.get("departmentId");
  const parsedDepartmentId = currentDepartmentId ? Number(currentDepartmentId) : undefined;

  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: scopedCategories = [], isLoading: categoriesLoading } = useCategories({
    departmentId: parsedDepartmentId,
  });

  const [departmentsOpen, setDepartmentsOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const selectedDepartment = useMemo(() => {
    if (!parsedDepartmentId) return null;
    return departments.find((item) => item.id === parsedDepartmentId) ?? null;
  }, [departments, parsedDepartmentId]);

  const navButtonBase =
    "relative w-full justify-start gap-3 h-auto py-3 rounded-lg transition-colors text-white/85 hover:text-white hover:bg-white/10";

  const brand = (
    <div
      className={cn(
        "flex h-20 items-center border-b border-white/10",
        isCollapsed ? "justify-center" : "px-6"
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-white/10">
        <FileText className="h-5 w-5 text-white" />
      </div>
      {!isCollapsed ? (
        <div className="ml-3 min-w-0">
          <div className="font-heading text-lg leading-5 font-semibold text-white">GED Pro</div>
          {selectedDepartment ? (
            <div className="truncate font-sans text-xs text-white/60">
              {selectedDepartment.name}
            </div>
          ) : (
            <div className="truncate font-sans text-xs text-white/60">Console documentaire</div>
          )}
        </div>
      ) : null}
    </div>
  );

  const NavItem = ({
    href,
    label,
    icon: Icon,
    description,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
  }) => {
    const active = isRouteActive(pathname, href);

    const content = (
      <Link href={href} className={cn(isCollapsed ? "px-2" : "px-4")}>
        <Button
          variant="ghost"
          className={cn(
            navButtonBase,
            isCollapsed ? "justify-center px-0" : "px-3",
            active && "bg-white/15 text-white"
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-transparent",
              active && "bg-emerald-300"
            )}
          />
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl ring-1 transition-colors",
              active ? "bg-white/15 ring-white/15" : "bg-white/5 ring-white/10"
            )}
          >
            <Icon className="h-5 w-5 shrink-0 text-white" />
          </span>
          {!isCollapsed ? (
            <div className="min-w-0 text-left">
              <div className="font-heading truncate text-sm font-medium text-white">{label}</div>
              {description ? (
                <div className="truncate font-sans text-xs text-white/55">{description}</div>
              ) : null}
            </div>
          ) : null}
        </Button>
      </Link>
    );

    if (!isCollapsed) return content;

    return (
      <Tooltip.Provider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              align="center"
              sideOffset={10}
              className="z-50 rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg"
            >
              {label}
              <Tooltip.Arrow className="fill-slate-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  };

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col overflow-x-hidden transition-all duration-300 md:flex",
        "border-r border-white/10 bg-gradient-to-b from-emerald-700 to-emerald-900",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {brand}

      <nav
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto py-4",
          isCollapsed ? "px-0" : "px-2"
        )}
      >
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              description={item.description}
            />
          ))}
        </div>

        <div className={cn("my-4 h-px bg-white/10", isCollapsed ? "mx-3" : "mx-4")} />

        <button
          type="button"
          onClick={() => setDepartmentsOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg transition-colors hover:bg-white/10",
            isCollapsed ? "mx-2 justify-center px-0 py-2" : "mx-3 px-3 py-2"
          )}
        >
          <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <Building2 className="h-4 w-4 text-white" />
            </span>
            {!isCollapsed ? (
              <div>
                <div className="font-heading text-sm font-medium text-white">Départements</div>
                <div className="font-sans text-xs text-white/55">Navigation contextuelle</div>
              </div>
            ) : null}
          </div>

          {!isCollapsed ? (
            departmentsOpen ? (
              <ChevronDown className="h-4 w-4 text-white/70" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white/70" />
            )
          ) : null}
        </button>

        {departmentsOpen && !isCollapsed ? (
          <div className="space-y-1 pl-2">
            {departmentsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-white/10" />
              ))
            ) : departments.length > 0 ? (
              departments.map((department) => {
                const active = department.id === parsedDepartmentId;

                return (
                  <div key={department.id} className="space-y-1">
                    <Link href={`/departments?departmentId=${department.id}`}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "relative h-auto w-full justify-start gap-3 py-3 text-white/80 hover:bg-white/10 hover:text-white",
                          active && "bg-white/15 text-white"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1/2 left-1 h-5 w-[3px] -translate-y-1/2 rounded-full bg-transparent",
                            active && "bg-emerald-300"
                          )}
                        />
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                          <Building2 className="h-4 w-4 text-white" />
                        </span>
                        <div className="min-w-0 text-left">
                          <div className="font-heading truncate text-sm font-medium text-white">
                            {department.name}
                          </div>
                          <div className="font-sans text-xs text-white/55">
                            {department.active ? "Actif" : "Inactif"}
                          </div>
                        </div>
                      </Button>
                    </Link>

                    {active ? (
                      <div className="ml-4 space-y-1">
                        <button
                          type="button"
                          onClick={() => setCategoriesOpen((prev) => !prev)}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <Tags className="h-4 w-4 text-white" />
                            <span className="font-sans text-xs font-medium text-white/70">
                              Catégories du département
                            </span>
                          </div>

                          {categoriesOpen ? (
                            <ChevronDown className="h-4 w-4 text-white/70" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-white/70" />
                          )}
                        </button>

                        {categoriesOpen ? (
                          <div className="space-y-1">
                            <Link href={`/categories?departmentId=${department.id}`}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-3 text-white/70 hover:bg-white/10",
                                  pathname === "/categories" && active && "bg-white/15 text-white"
                                )}
                              >
                                <Tags className="h-4 w-4 text-white" />
                                <span className="font-heading text-sm">Gérer les catégories</span>
                              </Button>
                            </Link>

                            <Link href={`/documents?departmentId=${department.id}`}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-3 text-white/70 hover:bg-white/10",
                                  pathname === "/documents" &&
                                    active &&
                                    !searchParams.get("categoryId") &&
                                    "bg-white/15 text-white"
                                )}
                              >
                                <FolderOpen className="h-4 w-4 text-white" />
                                <span className="font-heading text-sm">
                                  Documents du département
                                </span>
                              </Button>
                            </Link>

                            {categoriesLoading ? (
                              Array.from({ length: 3 }).map((_, index) => (
                                <div
                                  key={index}
                                  className="h-8 animate-pulse rounded-lg bg-white/10"
                                />
                              ))
                            ) : scopedCategories.length > 0 ? (
                              scopedCategories.map((category) => {
                                const activeCategoryId = searchParams.get("categoryId");
                                const categoryActive =
                                  pathname === "/documents" &&
                                  activeCategoryId &&
                                  Number(activeCategoryId) === category.id;

                                return (
                                  <Link
                                    key={category.id}
                                    href={`/documents?departmentId=${department.id}&categoryId=${category.id}`}
                                  >
                                    <Button
                                      variant="ghost"
                                      className={cn(
                                        "w-full justify-start gap-3 text-white/70 hover:bg-white/10",
                                        categoryActive && "bg-white/15 text-white"
                                      )}
                                    >
                                      <Tags className="h-4 w-4 text-white" />
                                      <span className="font-heading truncate text-sm">
                                        {category.name}
                                      </span>
                                    </Button>
                                  </Link>
                                );
                              })
                            ) : (
                              <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-2 font-sans text-xs text-white/60">
                                Aucune catégorie.
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-3 font-sans text-sm text-white/60">
                Aucun département.
              </div>
            )}
          </div>
        ) : null}
      </nav>

      <div className="border-t border-white/10 py-4">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-3 text-white transition-colors hover:bg-white/10",
            isCollapsed ? "justify-center px-0" : "px-6 py-2"
          )}
          aria-label={isCollapsed ? "Déplier la sidebar" : "Réduire la sidebar"}
          title={isCollapsed ? "Déplier" : "Réduire"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="font-sans text-sm">Réduire</span>
            </>
          )}
        </button>

        {!isCollapsed ? (
          <div className="mt-3 px-6 text-center font-sans text-[11px] text-white/45">
            v1.0.0 - GED Pro
          </div>
        ) : null}
      </div>
    </aside>
  );
}
