"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function confirmClientDriveAccessAction(input: {
  codigo: string;
  token: string;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase no esta configurado en el servidor.");
  }

  const { error } = await supabase.rpc("client_confirm_drive_access", {
    p_codigo: input.codigo,
    p_token: input.token
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/cliente/${input.codigo}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/clientes/${input.codigo}`);

  return { ok: true };
}
