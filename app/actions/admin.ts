"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { fetchClientPortalData } from "@/lib/data";
import {
  normalizeProjectStage,
  normalizeProjectStatus
} from "@/lib/project-progress-options";
import type {
  ActivityEventType,
  AdminClientRecord,
  DriveStatus,
  PaymentMethod,
  ProjectStage,
  ProjectStatus,
  ServicePlan
} from "@/types";

type CreateAdminClientInput = {
  nombre_cliente_1: string;
  plan: ServicePlan;
  partes_incluidas: string[];
  metodo_pago: PaymentMethod;
  precio_total: number;
  valor_entrada: number;
  numero_cuotas: number;
  installments: {
    numero_cuota: number;
    monto: number;
    fecha_vencimiento: string;
    estado: "pendiente" | "pagado";
  }[];
};

export async function createAdminClientAction(
  input: CreateAdminClientInput
): Promise<AdminClientRecord> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase no esta configurado en el servidor.");
  }

  const { data, error } = await supabase.rpc("create_admin_client", {
    payload: input
  });

  if (error) {
    throw new Error(error.message);
  }

  const portalData = await fetchClientPortalData(data.codigo, data.token);

  if (!portalData) {
    throw new Error("No se pudo recuperar el cliente creado.");
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/clientes/${portalData.client.codigo}`);
  revalidatePath(`/cliente/${portalData.client.codigo}`);

  return {
    client: portalData.client,
    service: portalData.service
  };
}

export async function updateClientDriveAction(input: {
  codigo: string;
  drive_url: string;
  drive_estado: DriveStatus;
  drive_compartido_at: string;
  drive_observaciones: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return { ok: false, error: "Supabase no está configurado en el servidor." };
    }

    if (!isDriveStatus(input.drive_estado)) {
      return { ok: false, error: "Estado Drive inválido." };
    }

    const { error } = await supabase.rpc("admin_update_client_drive", {
      p_codigo: input.codigo,
      payload: {
        drive_url: input.drive_url.trim(),
        drive_estado: input.drive_estado,
        drive_compartido_at: input.drive_compartido_at || null,
        drive_observaciones: input.drive_observaciones.trim()
      }
    });

    if (error) {
      console.error("updateClientDriveAction failed", {
        codigo: input.codigo,
        driveEstado: input.drive_estado,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      return { ok: false, error: "No se pudo actualizar la gestión Drive." };
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/clientes/${input.codigo}`);
    revalidatePath(`/cliente/${input.codigo}`);

    return { ok: true };
  } catch (error) {
    console.error("updateClientDriveAction unexpected error", error);

    return { ok: false, error: "No se pudo actualizar la gestión Drive." };
  }
}

export async function updateProjectProgressAction(input: {
  codigo: string;
  project_stage: ProjectStage;
  project_status: ProjectStatus;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return { ok: false, error: "Supabase no está configurado en el servidor." };
    }

    const projectStage = normalizeProjectStage(input.project_stage);
    const projectStatus = normalizeProjectStatus(input.project_status);

    if (!projectStage || !projectStatus) {
      return { ok: false, error: "No se pudo actualizar el avance" };
    }

    const { error } = await supabase.rpc("admin_update_project_progress", {
      p_codigo: input.codigo,
      payload: {
        project_stage: projectStage,
        project_status: projectStatus
      }
    });

    if (error) {
      console.error("updateProjectProgressAction failed", {
        codigo: input.codigo,
        projectStage,
        projectStatus,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      return { ok: false, error: "No se pudo actualizar el avance" };
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/clientes/${input.codigo}`);
    revalidatePath(`/cliente/${input.codigo}`);

    return { ok: true };
  } catch (error) {
    console.error("updateProjectProgressAction unexpected error", error);

    return { ok: false, error: "No se pudo actualizar el avance" };
  }
}

export async function approvePaymentAction(input: {
  codigo: string;
  paymentId: string;
}) {
  return validatePayment({
    codigo: input.codigo,
    paymentId: input.paymentId,
    decision: "aprobado"
  });
}

export async function rejectPaymentAction(input: {
  codigo: string;
  paymentId: string;
  rejectionReason: string;
}) {
  return validatePayment({
    codigo: input.codigo,
    paymentId: input.paymentId,
    decision: "rechazado",
    rejectionReason: input.rejectionReason
  });
}

export async function updateClientLifecycleAction(input: {
  codigo: string;
  action: "cerrar" | "archivar" | "reactivar";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return { ok: false, error: "Supabase no está configurado en el servidor." };
    }

    const { error } = await supabase.rpc("admin_update_client_lifecycle", {
      p_codigo: input.codigo,
      p_action: input.action
    });

    if (error) {
      console.error("updateClientLifecycleAction failed", {
        codigo: input.codigo,
        action: input.action,
        message: error.message
      });

      return { ok: false, error: "No se pudo actualizar el estado del cliente" };
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/clientes/${input.codigo}`);
    revalidatePath(`/cliente/${input.codigo}`);

    return { ok: true };
  } catch (error) {
    console.error("updateClientLifecycleAction unexpected error", error);

    return { ok: false, error: "No se pudo actualizar el estado del cliente" };
  }
}

export async function createActivityLog(input: {
  codigo: string;
  eventType: ActivityEventType;
  description: string;
  actor: "admin" | "cliente";
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase no esta configurado en el servidor.");
  }

  const { error } = await supabase.rpc("create_activity_log", {
    p_codigo: input.codigo,
    p_event_type: input.eventType,
    p_description: input.description,
    p_actor: input.actor,
    p_metadata: input.metadata ?? {}
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/clientes/${input.codigo}`);
  revalidatePath(`/cliente/${input.codigo}`);

  return { ok: true };
}

async function validatePayment(input: {
  codigo: string;
  paymentId: string;
  decision: "aprobado" | "rechazado";
  rejectionReason?: string;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase no esta configurado en el servidor.");
  }

  const { error } = await supabase.rpc("admin_validate_payment", {
    p_codigo: input.codigo,
    p_payment_id: input.paymentId,
    p_decision: input.decision,
    p_rejection_reason: input.rejectionReason ?? null,
    p_validated_by: "admin"
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/clientes/${input.codigo}`);
  revalidatePath(`/cliente/${input.codigo}`);
  revalidatePath(`/cliente/${input.codigo}/pagos`);

  return { ok: true };
}

function isDriveStatus(value: unknown): value is DriveStatus {
  return ["pendiente", "compartido", "activo"].includes(String(value));
}
