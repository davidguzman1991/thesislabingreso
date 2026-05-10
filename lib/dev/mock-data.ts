import type {
  ActivityLog,
  Client,
  Payment,
  Project,
  RegistrationFormData,
  ServiceContract
} from "@/types";

export const mockClient: Client = {
  codigo: "TL-0001",
  token: "abc123",
  nombre_cliente_1: "Andrea Valentina Mora",
  nombre_cliente_2: "Carlos Daniel Ruiz",
  cedula_cliente_1: "0912345678",
  cedula_cliente_2: "0923456789",
  whatsapp: "+593 99 123 4567",
  email: "andrea.mora@example.com",
  gmail_drive: "andrea.mora@gmail.com",
  provincia: "Guayas",
  ciudad: "Guayaquil",
  estado_formulario: "completo",
  estado_cliente: "activo",
  closed_at: undefined,
  archived_at: undefined,
  deleted_at: undefined,
  acepta_comunicaciones: false,
  drive_url: "https://drive.google.com/drive/folders/thesislab-demo",
  drive_estado: "compartido",
  drive_confirmado_cliente: false,
  drive_compartido_at: "2026-05-09T14:00:00Z",
  drive_observaciones: "Carpeta demo compartida con Gmail registrado."
};

export const mockPendingClient: Client = {
  ...mockClient,
  codigo: "TL-0002",
  token: "pendiente123",
  nombre_cliente_1: "Mateo Alejandro Vera",
  nombre_cliente_2: undefined,
  estado_formulario: "pendiente",
  drive_url: undefined,
  drive_estado: "pendiente",
  drive_confirmado_cliente: false,
  drive_compartido_at: undefined,
  drive_observaciones: undefined
};

export const mockProject: Project = {
  codigo_cliente: "TL-0001",
  project_stage: "desarrollo_academico",
  project_status: "a_tiempo",
  universidad: "Universidad Catolica de Santiago de Guayaquil",
  facultad: "Facultad de Ciencias Medicas",
  carrera: "Enfermeria",
  nivel: "pregrado",
  tipo_trabajo: "tesis",
  tutor: "Dra. Maria Fernanda Cedeño",
  titulo: "Factores asociados a la adherencia terapeutica en pacientes adultos",
  anteproyecto_aprobado: true,
  fecha_limite: "2026-07-18",
  base_datos: true,
  tipo_citas: "Vancouver",
  paginas: "60-80",
  observaciones:
    "Cliente requiere seguimiento semanal y revision de instrumento antes del analisis.",
  drive_url: "https://drive.google.com/drive/folders/thesislab-demo"
};

export const mockService: ServiceContract = {
  codigo_cliente: "TL-0001",
  plan: "Desarrollo a medida",
  partes_incluidas: [
    "Tema",
    "Planteamiento del problema",
    "Objetivos",
    "Marco teorico",
    "Metodologia",
    "Instrumento",
    "Base de datos",
    "Resultados",
    "Discusion",
    "Correcciones",
    "Diapositivas",
    "Sustentacion"
  ],
  metodo_pago: "transferencia",
  cuotas: 3,
  precio_total: 980,
  valor_entrada: 350,
  saldo_pendiente: 630,
  fechas_pago: [
    {
      numero: 1,
      monto: 350,
      fecha_vencimiento: "2026-04-25",
      estado: "pagado"
    },
    {
      numero: 2,
      monto: 315,
      fecha_vencimiento: "2026-05-20",
      estado: "pendiente"
    },
    {
      numero: 3,
      monto: 315,
      fecha_vencimiento: "2026-06-20",
      estado: "pendiente"
    }
  ]
};

export const mockPayments: Payment[] = [
  {
    id: "pay_001",
    codigo_cliente: "TL-0001",
    monto: 350,
    fecha_pago: "2026-04-24",
    metodo: "transferencia",
    comprobante_url: "https://drive.google.com/file/d/demo-payment",
    observacion: "Entrada inicial reportada por transferencia bancaria.",
    estado: "aprobado",
    created_at: "2026-04-24T16:20:00Z",
    validated_at: "2026-04-24T18:00:00Z",
    validated_by: "admin"
  },
  {
    id: "pay_002",
    codigo_cliente: "TL-0001",
    monto: 315,
    fecha_pago: "2026-05-03",
    metodo: "transferencia",
    comprobante_url: "https://drive.google.com/file/d/demo-payment-2",
    estado: "reportado",
    created_at: "2026-05-03T15:40:00Z"
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "log_001",
    codigo_cliente: "TL-0001",
    event_type: "onboarding_completed",
    description: "Cliente completó onboarding",
    actor: "cliente",
    metadata: {},
    created_at: "2026-04-23T13:00:00Z"
  },
  {
    id: "log_002",
    codigo_cliente: "TL-0001",
    event_type: "payment_reported",
    description: "Pago reportado — $350,00",
    actor: "cliente",
    metadata: { monto: 350 },
    created_at: "2026-04-24T16:20:00Z"
  },
  {
    id: "log_003",
    codigo_cliente: "TL-0001",
    event_type: "payment_approved",
    description: "Pago aprobado por admin — $350,00",
    actor: "admin",
    metadata: { monto: 350 },
    created_at: "2026-04-24T18:00:00Z"
  }
];

export const getClientPortalData = (codigo: string) => {
  const client = codigo === mockPendingClient.codigo ? mockPendingClient : mockClient;

  return {
    client,
    project: mockProject,
    service: mockService,
    payments: codigo === mockPendingClient.codigo ? [] : mockPayments,
    activityLogs: codigo === mockPendingClient.codigo ? [] : mockActivityLogs
  };
};

export const getRegistrationFormDefaults = (codigo: string): RegistrationFormData => {
  const { client, project } = getClientPortalData(codigo);

  return {
    client: {
      nombre_cliente_1: client.nombre_cliente_1,
      cedula_cliente_1: client.cedula_cliente_1,
      nombre_cliente_2: client.nombre_cliente_2 ?? "",
      cedula_cliente_2: client.cedula_cliente_2 ?? "",
      whatsapp: client.whatsapp,
      email: client.email,
      gmail_drive: client.gmail_drive,
      provincia: client.provincia,
      ciudad: client.ciudad
    },
    academic: {
      universidad: project.universidad,
      facultad: project.facultad,
      carrera: project.carrera,
      nivel: project.nivel,
      tipo_trabajo: project.tipo_trabajo,
      tutor: project.tutor,
      titulo: project.titulo
    },
    projectState: {
      anteproyecto_aprobado: project.anteproyecto_aprobado,
      fecha_limite: project.fecha_limite,
      base_datos: project.base_datos,
      observaciones: project.observaciones
    },
    academicFormat: {
      tipo_citas: project.tipo_citas,
      paginas: project.paginas
    },
    documents: {
      documentos_disponibles: null,
      drive_url: project.drive_url,
      observaciones_importantes: ""
    },
    conditions: {
      informacion_correcta: false,
      autorizacion_documentos: false,
      confidencialidad_bilateral: false,
      acepta_acompanamiento: false,
      responsabilidad_universidad: false,
      condiciones_pago_entregas: false,
      acepta_comunicaciones: client.acepta_comunicaciones
    }
  };
};
