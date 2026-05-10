import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { PaymentReportForm } from "@/components/client/payment-report-form";
import {
  ArchivedProjectView,
  ClosedProjectView
} from "@/components/client/project-closure-view";
import { Card, CardContent } from "@/components/ui/card";
import { fetchClientPortalData } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PagosPage({
  params,
  searchParams
}: {
  params: { codigo: string };
  searchParams: { token?: string };
}) {
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
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300">
                El enlace de pagos no existe o el token privado no coincide.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  if (data.client.estado_cliente === "archivado") {
    return <ArchivedProjectView />;
  }

  if (data.client.estado_cliente === "cerrado") {
    return (
      <ClosedProjectView
        client={data.client}
        project={data.project}
        service={data.service}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#0B132B] px-4 py-8 text-gray-200 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link
          href={`/cliente/${params.codigo}?token=${data.client.token}`}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Volver al portal
        </Link>
        <Card className="border-[#1E2D5C] bg-[#131F43]">
          <CardContent>
            <p className="text-sm font-medium text-[#00E5FF]">Registro de pagos</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Reportar comprobante
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Registra aquí tus pagos para mantener actualizado tu estado financiero.
              ThesisLab validará manualmente cada comprobante.
            </p>
            <div className="mt-6">
              <PaymentReportForm codigo={params.codigo} token={data.client.token} />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
