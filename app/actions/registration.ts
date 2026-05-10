"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { RegistrationFormData } from "@/types";

export async function completeRegistrationAction(input: {
  codigo: string;
  token: string;
  formData: RegistrationFormData;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase no esta configurado en el servidor.");
  }

  const { data, error } = await supabase.rpc("complete_client_registration", {
    p_codigo: input.codigo,
    p_token: input.token,
    payload: input.formData
  });

  if (error) {
    throw new Error(error.message);
  }

  if (
    !data ||
    data.codigo !== input.codigo ||
    data.token !== input.token ||
    data.estado_formulario !== "completo"
  ) {
    throw new Error("No se pudo confirmar el estado completo del cliente.");
  }

  revalidatePath(`/cliente/${input.codigo}`);
  revalidatePath(`/cliente/${input.codigo}/registro`);
  revalidatePath("/admin");
  revalidatePath(`/admin/clientes/${input.codigo}`);

  return { ok: true };
}
