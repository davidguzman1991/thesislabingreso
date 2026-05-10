import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Client } from "@/types";

export function NextSteps({ client }: { client: Client }) {
  const items = [
    { label: "Completar registro", done: client.estado_formulario === "completo" },
    { label: "Subir documentos al Drive", done: false },
    { label: "Confirmar fechas de entrega", done: true },
    { label: "Reportar pagos según cronograma", done: false }
  ];

  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold text-white">Próximos pasos</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const Icon = item.done ? CheckCircle2 : Circle;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[#1E2D5C] bg-[#131F43] p-3"
              >
                <Icon
                  className={`size-5 ${item.done ? "text-[#00E5FF]" : "text-gray-400"}`}
                />
                <span className="text-sm font-medium text-white">{item.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
