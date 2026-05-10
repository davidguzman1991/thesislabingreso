import { notFound } from "next/navigation";
import { AdminClientDetail } from "@/components/admin/admin-client-detail";
import { fetchAdminClientDetail } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminClientDetailPage({
  params
}: {
  params: { codigo: string };
}) {
  const data = await fetchAdminClientDetail(params.codigo);

  if (!data) {
    notFound();
  }

  return <AdminClientDetail data={data} />;
}
