"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { PaymentMethod } from "@/types";

export async function reportPaymentAction(input: {
  codigo: string;
  token: string;
  monto: number;
  fecha_pago: string;
  metodo: PaymentMethod;
  comprobante_url: string;
  observacion: string;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase no esta configurado en el servidor.");
  }

  const { error } = await supabase.rpc("report_client_payment", {
    p_codigo: input.codigo,
    p_token: input.token,
    payload: {
      monto: input.monto,
      fecha_pago: input.fecha_pago,
      metodo: input.metodo,
      comprobante_url: input.comprobante_url,
      observacion: input.observacion
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/cliente/${input.codigo}`);
  revalidatePath(`/cliente/${input.codigo}/pagos`);
  revalidatePath("/admin");
  revalidatePath(`/admin/clientes/${input.codigo}`);

  return { ok: true };
}
