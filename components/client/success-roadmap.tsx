import { Check, Clock3, FileSearch, GraduationCap, NotebookPen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProjectStage } from "@/types";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Registro completado", icon: Check, key: "registro_completado" },
  { label: "Documentos recibidos", icon: NotebookPen, key: "documentos_recibidos" },
  { label: "Desarrollo académico", icon: GraduationCap, key: "desarrollo_academico" },
  { label: "Revisión", icon: FileSearch, key: "revision" },
  { label: "Entrega final", icon: Check, key: "entrega_final" }
] as const;

const stageIndex: Record<ProjectStage, number> = {
  registro_completado: 0,
  documentos_recibidos: 1,
  desarrollo_academico: 2,
  revision: 3,
  entrega_final: 4
};

export function SuccessRoadmap({ stage }: { stage: ProjectStage }) {
  const currentIndex = stageIndex[stage];
  const progress = Math.min(100, Math.max(20, (currentIndex / (steps.length - 1)) * 100));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#00E5FF]">Roadmap de avance</p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Avance del proyecto
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-3 py-2 text-sm text-gray-300">
            <Clock3 className="size-4 text-[#00E5FF]" />
            Seguimiento activo
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={progress} />
        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isDone = currentIndex > index;
            const isActive = currentIndex === index;

            return (
              <div
                key={step.label}
                className={cn(
                  "rounded-xl border p-3 transition duration-200",
                  isDone && "border-[#00E5FF]/25 bg-[#00E5FF]/10",
                  isActive &&
                    "border-2 border-[#5C2D91] bg-[#131F43] shadow-[0_16px_40px_rgba(92,45,145,0.22)] ring-4 ring-[#5C2D91]/15",
                  !isDone && !isActive && "border-[#1E2D5C] bg-[#131F43]"
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex size-9 items-center justify-center rounded-lg",
                    isDone && "bg-[#00E5FF] text-[#0B132B]",
                    isActive && "bg-[#5C2D91] text-white",
                    !isDone && !isActive && "bg-gray-500/15 text-gray-400"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                {isActive ? (
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#5C2D91]">
                    Paso actual
                  </p>
                ) : null}
                <p className="text-sm font-medium leading-5 text-white">
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
