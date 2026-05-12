import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { ArchivedClientsPanel } from "@/components/admin/archived-clients-panel";
import { fetchArchivedClientRecords } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminArchivePage() {
  const records = await fetchArchivedClientRecords();

  return (
    <main className="min-h-screen bg-[#0B132B] px-4 py-8 text-gray-200 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Volver al panel
            </Link>
            <p className="mt-5 text-sm font-medium text-[#00E5FF]">
              ThesisLab Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Archivo operativo
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
              Gestiona proyectos cerrados o archivados fuera de la cartera activa.
              Desde aquí puedes reactivarlos o eliminarlos definitivamente.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#00E5FF]/60"
            >
              <Archive className="size-4" />
              Cartera activa
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <ArchivedClientsPanel records={records} />
      </section>
    </main>
  );
}
