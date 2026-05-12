import Link from "next/link";
import { Archive } from "lucide-react";
import { AdminClientPanel } from "@/components/admin/admin-client-panel";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { fetchAdminClientRecords } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const records = await fetchAdminClientRecords();

  return (
    <main className="min-h-screen bg-[#0B132B] px-4 py-8 text-gray-200 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#00E5FF]">ThesisLab Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Panel operativo
            </h1>
            <p className="mt-2 text-sm text-gray-300">
              Panel interno para gestionar clientes, cronogramas, pagos y seguimiento
              académico.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/archivo"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#00E5FF]/60"
            >
              <Archive className="size-4" />
              Ver archivo
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
        <AdminClientPanel initialRecords={records} />
      </section>
    </main>
  );
}
