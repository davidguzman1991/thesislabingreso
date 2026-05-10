import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldAlert } from "lucide-react";
import { EvidenceRepository } from "@/components/client/evidence-repository";
import { FinancialSnapshot } from "@/components/client/financial-snapshot";
import { NextSteps } from "@/components/client/next-steps";
import { PortalHeader } from "@/components/client/portal-header";
import {
  ArchivedProjectView,
  ClosedProjectView
} from "@/components/client/project-closure-view";
import { RecentPayments } from "@/components/client/recent-payments";
import { StatusLights } from "@/components/client/status-lights";
import { SuccessRoadmap } from "@/components/client/success-roadmap";
import { Card, CardContent } from "@/components/ui/card";
import { fetchClientPortalData } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ClientPortalPageProps = {
  params: {
    codigo: string;
  };
  searchParams: {
    token?: string;
  };
};

export default async function ClientPortalPage({
  params,
  searchParams
}: ClientPortalPageProps) {
  const data = await fetchClientPortalData(params.codigo, searchParams.token);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#0B132B] px-4 py-8 text-gray-200 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl">
          <Card className="border-[#1E2D5C] bg-[#131F43]">
            <CardContent className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <ShieldAlert className="size-6" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold text-white">
                Acceso inválido
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400">
                El enlace no existe o el token privado no coincide con el cliente.
                Solicita un nuevo enlace a ThesisLab.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  const { client, project, service, payments } = data;

  if (client.estado_cliente === "archivado") {
    return <ArchivedProjectView />;
  }

  if (client.estado_cliente === "cerrado") {
    return (
      <ClosedProjectView client={client} project={project} service={service} />
    );
  }

  if (client.estado_formulario === "pendiente") {
    return (
      <main className="min-h-screen bg-[#0B132B] text-gray-200">
        <PortalHeader
          client={client}
          project={{
            ...project,
            project_stage: "registro_completado",
            project_status: "pendiente_datos"
          }}
        />
        <section className="mx-auto grid w-full max-w-3xl gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-[#1E2D5C] bg-[#131F43]">
            <CardContent className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                <LockKeyhole className="size-6" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">
                Bienvenido a tu espacio privado de ThesisLab
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400">
                Antes de habilitar tu portal, necesitamos que completes el Formulario 2
                con tus datos académicos, condiciones del servicio y cronograma base.
              </p>
              <Link
                href={`/cliente/${client.codigo}/registro?token=${client.token}`}
                className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#5C2D91] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#4a2475] focus:outline-none focus:ring-4 focus:ring-[#00E5FF]/15"
              >
                Iniciar registro
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B132B] text-gray-200">
      <PortalHeader client={client} project={project} />
      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.35fr_0.85fr] lg:px-8">
        <div className="grid gap-5">
          <SuccessRoadmap stage={project.project_stage} />
          <EvidenceRepository client={client} project={project} />
          <StatusLights status={project.project_status} />
          <RecentPayments payments={payments} />
        </div>
        <aside className="grid content-start gap-5">
          <FinancialSnapshot
            service={service}
            codigo={client.codigo}
            token={client.token}
          />
          <NextSteps client={client} />
        </aside>
      </section>
    </main>
  );
}
