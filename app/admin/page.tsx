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
          <AdminLogoutButton />
        </div>
        <AdminClientPanel initialRecords={records} />
      </section>
    </main>
  );
}
