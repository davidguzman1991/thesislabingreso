import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import {
  normalizeProjectStage,
  normalizeProjectStatus
} from "@/lib/project-progress-options";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type {
  ActivityLog,
  AdminClientRecord,
  Client,
  Installment,
  Payment,
  Project,
  ServiceContract
} from "@/types";

type DbClient = {
  id: string;
  codigo: string;
  token: string;
  nombre_cliente_1: string;
  nombre_cliente_2: string | null;
  cedula_cliente_1: string;
  cedula_cliente_2: string | null;
  whatsapp: string;
  email: string;
  gmail_drive: string;
  provincia: string;
  ciudad: string;
  estado_formulario: "pendiente" | "completo";
  estado_cliente: Client["estado_cliente"] | null;
  closed_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  acepta_comunicaciones: boolean | null;
  drive_url: string | null;
  drive_estado: Client["drive_estado"] | null;
  drive_confirmado_cliente: boolean | null;
  drive_compartido_at: string | null;
  drive_observaciones: string | null;
  projects?: DbProject[];
  services?: DbService[];
  installments?: DbInstallment[];
  payments?: DbPayment[];
  activity_logs?: DbActivityLog[];
};

type DbProject = {
  project_stage: Project["project_stage"] | null;
  project_status: Project["project_status"] | null;
  universidad: string;
  facultad: string;
  carrera: string;
  nivel: Project["nivel"] | "";
  tipo_trabajo: Project["tipo_trabajo"] | "";
  tutor: string;
  titulo: string;
  anteproyecto_aprobado: boolean;
  fecha_limite: string | null;
  base_datos: boolean;
  tipo_citas: Project["tipo_citas"] | "";
  paginas: Project["paginas"] | "";
  observaciones: string | null;
};

type DbService = {
  plan: ServiceContract["plan"];
  partes_incluidas: string[] | null;
  metodo_pago: ServiceContract["metodo_pago"];
  precio_total: number | string;
  valor_entrada: number | string;
  saldo_pendiente: number | string;
  numero_cuotas: number;
};

type DbInstallment = {
  numero_cuota: number;
  monto: number | string;
  fecha_vencimiento: string;
  estado: Installment["estado"];
};

type DbPayment = {
  id: string;
  monto: number | string;
  fecha_pago: string;
  metodo: Payment["metodo"];
  comprobante_url: string | null;
  observacion: string | null;
  estado: Payment["estado"];
  created_at: string;
  validated_at: string | null;
  validated_by: string | null;
  rejection_reason: string | null;
};

type DbActivityLog = {
  id: string;
  event_type: ActivityLog["event_type"];
  description: string;
  actor: ActivityLog["actor"];
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ClientPortalData = {
  client: Client;
  project: Project;
  service: ServiceContract;
  payments: Payment[];
  activityLogs: ActivityLog[];
};

const baseSelect = `
  *,
  projects (*),
  services (*),
  installments (*),
  payments (*)
`;

export async function fetchAdminClientRecords(): Promise<AdminClientRecord[]> {
  noStore();

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("clients")
    .select(baseSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DbClient[]).map(mapAdminRecord);
}

export async function fetchAdminClientDetail(
  codigo: string
): Promise<ClientPortalData | null> {
  noStore();

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("clients")
    .select(baseSelect)
    .eq("codigo", codigo)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const portalData = mapPortalData(data as DbClient);
  portalData.activityLogs = await fetchActivityLogs(supabase, portalData.client.codigo);

  return portalData;
}

export async function fetchClientPortalData(
  codigo: string,
  token?: string
): Promise<ClientPortalData | null> {
  noStore();

  const supabase = getSupabaseAdmin();

  if (!supabase || !token) {
    return null;
  }

  const { data, error } = await supabase
    .from("clients")
    .select(baseSelect)
    .eq("codigo", codigo)
    .eq("token", token)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPortalData(data as DbClient) : null;
}

function mapAdminRecord(row: DbClient): AdminClientRecord {
  return {
    client: mapClient(row),
    service: mapService(row)
  };
}

function mapPortalData(row: DbClient): ClientPortalData {
  return {
    client: mapClient(row),
    project: mapProject(row),
    service: mapService(row),
    payments: mapPayments(row),
    activityLogs: mapActivityLogs(row)
  };
}

function mapClient(row: DbClient): Client {
  return {
    codigo: row.codigo,
    token: row.token,
    nombre_cliente_1: row.nombre_cliente_1,
    nombre_cliente_2: row.nombre_cliente_2 ?? undefined,
    cedula_cliente_1: row.cedula_cliente_1,
    cedula_cliente_2: row.cedula_cliente_2 ?? undefined,
    whatsapp: row.whatsapp,
    email: row.email,
    gmail_drive: row.gmail_drive,
    provincia: row.provincia,
    ciudad: row.ciudad,
    estado_formulario: row.estado_formulario,
    estado_cliente: isClientStatus(row.estado_cliente) ? row.estado_cliente : "activo",
    closed_at: row.closed_at ?? undefined,
    archived_at: row.archived_at ?? undefined,
    deleted_at: row.deleted_at ?? undefined,
    acepta_comunicaciones: row.acepta_comunicaciones ?? false,
    drive_url: row.drive_url ?? undefined,
    drive_estado: isDriveStatus(row.drive_estado) ? row.drive_estado : "pendiente",
    drive_confirmado_cliente: row.drive_confirmado_cliente ?? false,
    drive_compartido_at: row.drive_compartido_at ?? undefined,
    drive_observaciones: row.drive_observaciones ?? undefined
  };
}

function mapProject(row: DbClient): Project {
  const project = row.projects?.[0];

  return {
    codigo_cliente: row.codigo,
    project_stage: normalizeProjectStage(project?.project_stage) ?? "registro_completado",
    project_status: normalizeProjectStatus(project?.project_status) ?? "a_tiempo",
    universidad: project?.universidad ?? "",
    facultad: project?.facultad ?? "",
    carrera: project?.carrera ?? "",
    nivel: project?.nivel === "posgrado" ? "posgrado" : "pregrado",
    tipo_trabajo: isProjectType(project?.tipo_trabajo) ? project.tipo_trabajo : "tesis",
    tutor: project?.tutor ?? "",
    titulo: project?.titulo ?? "",
    anteproyecto_aprobado: project?.anteproyecto_aprobado ?? false,
    fecha_limite: project?.fecha_limite ?? "",
    base_datos: project?.base_datos ?? false,
    tipo_citas: isCitationType(project?.tipo_citas) ? project.tipo_citas : "APA",
    paginas: isPageRange(project?.paginas) ? project.paginas : "40-60",
    observaciones: project?.observaciones ?? "",
    drive_url: row.drive_url ?? ""
  };
}

function mapService(row: DbClient): ServiceContract {
  const service = row.services?.[0];

  return {
    codigo_cliente: row.codigo,
    plan: service?.plan ?? "Estandar",
    partes_incluidas: Array.isArray(service?.partes_incluidas)
      ? service.partes_incluidas
      : [],
    metodo_pago: service?.metodo_pago ?? "transferencia",
    cuotas: service?.numero_cuotas ?? row.installments?.length ?? 1,
    precio_total: Number(service?.precio_total ?? 0),
    valor_entrada: Number(service?.valor_entrada ?? 0),
    saldo_pendiente: Number(service?.saldo_pendiente ?? 0),
    fechas_pago: mapInstallments(row)
  };
}

function mapInstallments(row: DbClient): Installment[] {
  return [...(row.installments ?? [])]
    .sort((a, b) => a.numero_cuota - b.numero_cuota)
    .map((installment) => ({
      numero: installment.numero_cuota,
      monto: Number(installment.monto),
      fecha_vencimiento: installment.fecha_vencimiento,
      estado: installment.estado
    }));
}

function mapPayments(row: DbClient): Payment[] {
  return [...(row.payments ?? [])]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((payment) => ({
      id: payment.id,
      codigo_cliente: row.codigo,
      monto: Number(payment.monto),
      fecha_pago: payment.fecha_pago,
      metodo: payment.metodo,
      comprobante_url: payment.comprobante_url ?? "",
      observacion: payment.observacion ?? undefined,
      estado: payment.estado,
      created_at: payment.created_at,
      validated_at: payment.validated_at ?? undefined,
      validated_by: payment.validated_by ?? undefined,
      rejection_reason: payment.rejection_reason ?? undefined
    }));
}

function mapActivityLogs(row: DbClient): ActivityLog[] {
  return [...(row.activity_logs ?? [])]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((log) => ({
      id: log.id,
      codigo_cliente: row.codigo,
      event_type: log.event_type,
      description: log.description,
      actor: log.actor,
      metadata: log.metadata ?? {},
      created_at: log.created_at
    }));
}

async function fetchActivityLogs(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  codigo: string
): Promise<ActivityLog[]> {
  if (!supabase) {
    return [];
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id,codigo")
    .eq("codigo", codigo)
    .maybeSingle();

  if (!client?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return [];
  }

  return (data as DbActivityLog[]).map((log) => ({
    id: log.id,
    codigo_cliente: codigo,
    event_type: log.event_type,
    description: log.description,
    actor: log.actor,
    metadata: log.metadata ?? {},
    created_at: log.created_at
  }));
}

function isProjectType(value: unknown): value is Project["tipo_trabajo"] {
  return [
    "tesis",
    "proyecto de investigacion",
    "articulo",
    "revision bibliografica",
    "estudio de caso",
    "otro"
  ].includes(String(value));
}

function isCitationType(value: unknown): value is Project["tipo_citas"] {
  return ["Vancouver", "APA", "Michigan", "Otros"].includes(String(value));
}

function isPageRange(value: unknown): value is Project["paginas"] {
  return ["40-60", "60-80", "80-100", "Mas de 100"].includes(String(value));
}

function isDriveStatus(value: unknown): value is Client["drive_estado"] {
  return ["pendiente", "compartido", "activo"].includes(String(value));
}

function isClientStatus(value: unknown): value is Client["estado_cliente"] {
  return ["activo", "en_pausa", "cerrado", "archivado"].includes(String(value));
}
