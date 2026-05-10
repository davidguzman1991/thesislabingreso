import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { RegistrationForm } from "@/components/client/registration-form";
import { fetchClientPortalData } from "@/lib/data";
import { buildRegistrationDefaults } from "@/lib/registration-defaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RegistroPage({
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
          <div className="surface-card p-6 text-center sm:p-8">
            <h1 className="text-2xl font-semibold text-white">
              Acceso inválido
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400">
              El enlace de registro no existe o el token privado no coincide.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (data.client.estado_formulario === "completo") {
    redirect(`/cliente/${params.codigo}?token=${data.client.token}`);
  }

  if (data.client.estado_cliente === "cerrado" || data.client.estado_cliente === "archivado") {
    redirect(`/cliente/${params.codigo}?token=${data.client.token}`);
  }

  const defaultValues = buildRegistrationDefaults(data);

  return (
    <main className="min-h-screen bg-[#0B132B] px-4 py-6 text-gray-200 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link
          href={`/cliente/${params.codigo}?token=${data.client.token}`}
          className="mb-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-1 text-sm font-medium text-gray-300 transition-colors hover:text-[#00E5FF]"
        >
          <ArrowLeft className="size-4" />
          Volver al portal
        </Link>
        <RegistrationForm
          codigo={params.codigo}
          client={data.client}
          service={data.service}
          defaultValues={defaultValues}
        />
      </section>
    </main>
  );
}
