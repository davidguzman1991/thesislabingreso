import Link from "next/link";
import { Archive, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Client, Project, ServiceContract } from "@/types";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

export function ClosedProjectView({
  client,
  project,
  service
}: {
  client: Client;
  project: Project;
  service: ServiceContract;
}) {
  return (
    <main className="min-h-screen bg-[#0B132B] px-4 py-8 text-gray-200 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-5">
        <Card className="border-[#1E2D5C] bg-[#131F43]">
          <CardContent className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF]">
              <CheckCircle2 className="size-7" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-white">
              Proyecto finalizado
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Gracias por confiar en ThesisLab. Tu proyecto queda cerrado y el
              historial operativo permanece disponible para consulta.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryCard label="Plan" value={service.plan === "Estandar" ? "Estándar" : service.plan} />
          <SummaryCard label="Fecha de cierre" value={formatDate(client.closed_at)} />
          <SummaryCard
            label="Estado financiero"
            value={
              service.saldo_pendiente <= 0
                ? "Sin saldo pendiente"
                : `${money.format(service.saldo_pendiente)} pendiente`
            }
          />
          <SummaryCard
            label="Etapa final"
            value={project.project_stage === "entrega_final" ? "Entrega final" : "Finalizado"}
          />
        </div>

        {client.drive_url ? (
          <Card className="border-[#1E2D5C] bg-[#131F43]">
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#00E5FF]">
                    Carpeta privada de trabajo
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Drive disponible
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    Puedes consultar los archivos compartidos mientras el acceso
                    siga habilitado por ThesisLab.
                  </p>
                </div>
                <Link
                  href={client.drive_url}
                  target="_blank"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#5C2D91] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a2475]"
                >
                  Abrir Drive
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

export function ArchivedProjectView() {
  return (
    <main className="min-h-screen bg-[#0B132B] px-4 py-8 text-gray-200 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Card className="border-[#1E2D5C] bg-[#131F43]">
          <CardContent className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Archive className="size-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-white">
              Proyecto archivado
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300">
              Este proyecto ha sido archivado. Contacta a ThesisLab si necesitas
              reactivar el acceso.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-[#1E2D5C] bg-[#131F43]">
      <CardContent>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-300">
          {label}
        </p>
        <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "No registrada";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}
