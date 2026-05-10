export type ProjectStage =
  | "registro_completado"
  | "documentos_recibidos"
  | "desarrollo_academico"
  | "revision"
  | "entrega_final";

export type ProjectStatus =
  | "a_tiempo"
  | "proximo_entrega"
  | "pendiente_datos"
  | "en_pausa"
  | "finalizado";

export type ServicePlan = "Estandar" | "Desarrollo a medida" | "Elite";

export type PaymentMethod =
  | "transferencia"
  | "tarjeta_credito"
  | "tarjeta_debito";

export type PaymentStatus = "reportado" | "aprobado" | "rechazado";

export type ActivityEventType =
  | "client_created"
  | "client_closed"
  | "client_archived"
  | "client_reactivated"
  | "onboarding_completed"
  | "drive_shared"
  | "drive_confirmed"
  | "payment_reported"
  | "payment_approved"
  | "payment_rejected"
  | "stage_updated"
  | "status_updated";

export type DriveStatus = "pendiente" | "compartido" | "activo";

export type ClientStatus = "activo" | "en_pausa" | "cerrado" | "archivado";

export type Client = {
  codigo: string;
  token: string;
  nombre_cliente_1: string;
  nombre_cliente_2?: string;
  cedula_cliente_1: string;
  cedula_cliente_2?: string;
  whatsapp: string;
  email: string;
  gmail_drive: string;
  provincia: string;
  ciudad: string;
  estado_formulario: "pendiente" | "completo";
  estado_cliente: ClientStatus;
  closed_at?: string;
  archived_at?: string;
  deleted_at?: string;
  acepta_comunicaciones: boolean;
  drive_url?: string;
  drive_estado: DriveStatus;
  drive_confirmado_cliente: boolean;
  drive_compartido_at?: string;
  drive_observaciones?: string;
};

export type Project = {
  codigo_cliente: string;
  project_stage: ProjectStage;
  project_status: ProjectStatus;
  universidad: string;
  facultad: string;
  carrera: string;
  nivel: "pregrado" | "posgrado";
  tipo_trabajo:
    | "tesis"
    | "proyecto de investigacion"
    | "articulo"
    | "revision bibliografica"
    | "estudio de caso"
    | "otro";
  tutor: string;
  titulo: string;
  anteproyecto_aprobado: boolean;
  fecha_limite: string;
  base_datos: boolean;
  tipo_citas: "Vancouver" | "APA" | "Michigan" | "Otros";
  paginas: "40-60" | "60-80" | "80-100" | "Mas de 100";
  observaciones: string;
  drive_url: string;
};

export type Installment = {
  numero: number;
  monto: number;
  fecha_vencimiento: string;
  estado: "pendiente" | "pagado" | "vencido";
};

export type Payment = {
  id: string;
  codigo_cliente: string;
  monto: number;
  fecha_pago: string;
  metodo: PaymentMethod;
  comprobante_url: string;
  observacion?: string;
  estado: PaymentStatus;
  created_at: string;
  validated_at?: string;
  validated_by?: string;
  rejection_reason?: string;
};

export type ActivityLog = {
  id: string;
  codigo_cliente: string;
  event_type: ActivityEventType;
  description: string;
  actor: "admin" | "cliente";
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ServiceContract = {
  codigo_cliente: string;
  plan: ServicePlan;
  partes_incluidas: string[];
  metodo_pago: PaymentMethod;
  cuotas: number;
  precio_total: number;
  valor_entrada: number;
  saldo_pendiente: number;
  fechas_pago: Installment[];
};

export type RegistrationFormData = {
  client: {
    nombre_cliente_1: string;
    cedula_cliente_1: string;
    nombre_cliente_2: string;
    cedula_cliente_2: string;
    whatsapp: string;
    email: string;
    gmail_drive: string;
    provincia: string;
    ciudad: string;
  };
  academic: {
    universidad: string;
    facultad: string;
    carrera: string;
    nivel: "pregrado" | "posgrado" | "";
    tipo_trabajo: Project["tipo_trabajo"] | "";
    tutor: string;
    titulo: string;
  };
  projectState: {
    anteproyecto_aprobado: boolean | null;
    fecha_limite: string;
    base_datos: boolean | null;
    observaciones: string;
  };
  academicFormat: {
    tipo_citas: Project["tipo_citas"] | "";
    paginas: Project["paginas"] | "";
  };
  documents: {
    documentos_disponibles: boolean | null;
    drive_url: string;
    observaciones_importantes: string;
  };
  conditions: {
    informacion_correcta: boolean;
    autorizacion_documentos: boolean;
    confidencialidad_bilateral: boolean;
    acepta_acompanamiento: boolean;
    responsabilidad_universidad: boolean;
    condiciones_pago_entregas: boolean;
    acepta_comunicaciones: boolean;
  };
};

export type AdminClientRecord = {
  client: Client;
  service: ServiceContract;
};
