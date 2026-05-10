import { AlertTriangle, CircleDot, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const lights = [
  {
    key: "a_tiempo",
    label: "A tiempo",
    detail: "Cronograma estable",
    icon: CircleDot,
    color: "text-[#00E5FF]",
    bg: "bg-[#00E5FF]/10"
  },
  {
    key: "proximo_entrega",
    label: "Próximo a entrega",
    detail: "Revisar fechas clave",
    icon: AlertTriangle,
    color: "text-amber-300",
    bg: "bg-amber-400/10"
  },
  {
    key: "pendiente_datos",
    label: "Pendiente de datos",
    detail: "Requiere insumos del cliente",
    icon: Clock,
    color: "text-gray-400",
    bg: "bg-gray-500/15"
  },
  {
    key: "en_pausa",
    label: "En pausa",
    detail: "Trabajo operativo detenido",
    icon: Clock,
    color: "text-gray-400",
    bg: "bg-gray-500/15"
  },
  {
    key: "finalizado",
    label: "Finalizado",
    detail: "Servicio completado",
    icon: CircleDot,
    color: "text-[#00E5FF]",
    bg: "bg-[#00E5FF]/10"
  }
] as const;

export function StatusLights({ status }: { status: ProjectStatus }) {
  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold text-white">Estado del proyecto</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {lights.map((light) => {
            const Icon = light.icon;
            const isActive = light.key === status;

            return (
              <div
                key={light.key}
                className={cn(
                  "rounded-xl border bg-[#131F43] p-4",
                  isActive
                    ? "border-[#00E5FF] shadow-[0_0_24px_rgba(0,229,255,0.12)]"
                    : "border-[#1E2D5C]"
                )}
              >
                <div className={`mb-3 flex size-9 items-center justify-center rounded-lg ${light.bg}`}>
                  <Icon className={`size-4 ${light.color}`} />
                </div>
                <p className="text-sm font-semibold text-white">{light.label}</p>
                <p className="mt-1 text-sm text-gray-300">{light.detail}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
