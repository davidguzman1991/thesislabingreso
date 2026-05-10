"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { updateProjectProgressAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  PROJECT_STAGE_OPTIONS,
  PROJECT_STATUS_OPTIONS
} from "@/lib/project-progress-options";
import type { Project, ProjectStage, ProjectStatus } from "@/types";

export function ProjectProgressForm({
  codigo,
  project
}: {
  codigo: string;
  project: Project;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    project_stage: project.project_stage,
    project_status: project.project_status
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(() => {
      updateProjectProgressAction({
        codigo,
        project_stage: formData.project_stage,
        project_status: formData.project_status
      })
        .then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setSuccess(true);
          router.refresh();
        })
        .catch(() => {
          setError("No se pudo actualizar el avance");
        });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2.5">
          <label>Etapa del proyecto</label>
          <select
            value={formData.project_stage}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                project_stage: event.target.value as ProjectStage
              }))
            }
          >
            {PROJECT_STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2.5">
          <label>Estado operativo</label>
          <select
            value={formData.project_status}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                project_status: event.target.value as ProjectStatus
              }))
            }
          >
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-white">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-4 text-sm font-medium text-white">
          <BadgeCheck className="size-4 text-[#00E5FF]" />
          Avance actualizado
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#5C2D91] text-white hover:bg-[#4a2475] sm:w-auto"
      >
        {isPending ? "Guardando..." : "Guardar avance"}
      </Button>
    </form>
  );
}
