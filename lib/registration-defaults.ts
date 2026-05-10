import type { ClientPortalData } from "@/lib/data";
import type { RegistrationFormData } from "@/types";

export function buildRegistrationDefaults(
  data: ClientPortalData
): RegistrationFormData {
  return {
    client: {
      nombre_cliente_1: safeText(data.client.nombre_cliente_1),
      cedula_cliente_1: safeText(data.client.cedula_cliente_1),
      nombre_cliente_2: data.client.nombre_cliente_2 ?? "",
      cedula_cliente_2: data.client.cedula_cliente_2 ?? "",
      whatsapp: safeText(data.client.whatsapp),
      email: safeText(data.client.email),
      gmail_drive: safeText(data.client.gmail_drive),
      provincia: safeText(data.client.provincia),
      ciudad: safeText(data.client.ciudad)
    },
    academic: {
      universidad: safeText(data.project.universidad),
      facultad: safeText(data.project.facultad),
      carrera: safeText(data.project.carrera),
      nivel: data.project.nivel,
      tipo_trabajo: data.project.tipo_trabajo,
      tutor: safeText(data.project.tutor),
      titulo: safeText(data.project.titulo)
    },
    projectState: {
      anteproyecto_aprobado: data.project.anteproyecto_aprobado,
      fecha_limite: safeText(data.project.fecha_limite),
      base_datos: data.project.base_datos,
      observaciones: safeText(data.project.observaciones)
    },
    academicFormat: {
      tipo_citas: data.project.tipo_citas,
      paginas: data.project.paginas
    },
    documents: {
      documentos_disponibles: null,
      drive_url: safeText(data.client.drive_url ?? data.project.drive_url),
      observaciones_importantes: ""
    },
    conditions: {
      informacion_correcta: false,
      autorizacion_documentos: false,
      confidencialidad_bilateral: false,
      acepta_acompanamiento: false,
      responsabilidad_universidad: false,
      condiciones_pago_entregas: false,
      acepta_comunicaciones: data.client.acepta_comunicaciones
    }
  };
}

function safeText(value: string | null | undefined) {
  return value ?? "";
}
