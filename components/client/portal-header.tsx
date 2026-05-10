import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Client, Project } from "@/types";

const statusLabel: Record<Project["project_status"], string> = {
  a_tiempo: "A tiempo",
  proximo_entrega: "Próximo a entrega",
  pendiente_datos: "Pendiente de datos",
  en_pausa: "En pausa",
  finalizado: "Finalizado"
};

export function PortalHeader({
  client,
  project
}: {
  client: Client;
  project: Project;
}) {
  return (
    <header className="border-b border-[#1E2D5C] bg-[#0B132B]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#5C2D91] text-white">
              <FlaskConical className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                ThesisLab
              </p>
              <p className="text-sm text-gray-400">El laboratorio de las Tesis</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone="accent"
              className="rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/10 px-3 py-1.5 text-sm font-medium text-[#00E5FF] shadow-[0_8px_24px_rgba(0,229,255,0.08)]"
            >
              {client.codigo} · {statusLabel[project.project_status]}
            </Badge>
          </div>
        </div>

        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[#00E5FF]">Resumen del proyecto</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Bienvenido nuevamente, {toTitleCase(client.nombre_cliente_1)}
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">
            Consulta el avance, tu estado financiero y el repositorio privado donde se
            centralizan evidencias, avances y entregables.
          </p>
        </div>
      </div>
    </header>
  );
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
