"use client";

import { useState } from "react";
import { BadgeCheck, FileText, Sparkles, TimerReset, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Contrato automatizado",
    status: "En desarrollo",
    tone: "accent" as const,
    description:
      "Generación automática de contratos con cláusulas, cronograma y datos del cliente.",
    icon: FileText
  },
  {
    title: "Cronograma exportable",
    status: "Próximamente",
    tone: "pending" as const,
    description:
      "Exportación visual de entregas, hitos y fechas importantes.",
    icon: TimerReset
  },
  {
    title: "Ficha operativa PDF",
    status: "Próximamente",
    tone: "pending" as const,
    description:
      "Resumen consolidado del proyecto para seguimiento administrativo.",
    icon: BadgeCheck
  },
  {
    title: "Generación asistida de documentos",
    status: "Beta futura",
    tone: "primary" as const,
    description:
      "Automatización académica y estructuración documental basada en los datos del proyecto.",
    icon: Sparkles
  }
];

export function DocumentCenterBeta() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#5C2D91] text-white hover:bg-[#4a2475]"
      >
        Centro documental (beta)
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 transition-opacity duration-200",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-[#1E2D5C] bg-[#0B132B] shadow-[-24px_0_60px_rgba(0,0,0,0.42)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Centro documental ThesisLab"
      >
        <div className="border-b border-[#1E2D5C] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium text-[#00E5FF]">
                <Sparkles className="size-3.5" />
                Beta
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Centro documental ThesisLab
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-300">
                Estamos preparando herramientas automatizadas para optimizar la
                gestión documental y académica de tu proyecto.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-[#1E2D5C] bg-[#131F43] text-gray-300 transition-colors hover:border-[#00E5FF]/60 hover:text-white"
              aria-label="Cerrar centro documental"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <section
                  key={item.title}
                  className="rounded-lg border border-[#1E2D5C] bg-[#131F43] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-10 items-center justify-center rounded-lg bg-[#00E5FF]/10 text-[#00E5FF]">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      tone={item.tone}
                      className="shrink-0 border-[#1E2D5C] bg-[#0B132B] text-gray-200"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
