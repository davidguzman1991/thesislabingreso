import type { ProjectStage, ProjectStatus } from "@/types";

export const PROJECT_STAGE_OPTIONS: { label: string; value: ProjectStage }[] = [
  { label: "Registro completado", value: "registro_completado" },
  { label: "Documentos recibidos", value: "documentos_recibidos" },
  { label: "Desarrollo académico", value: "desarrollo_academico" },
  { label: "Revisión", value: "revision" },
  { label: "Entrega final", value: "entrega_final" }
];

export const PROJECT_STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: "A tiempo", value: "a_tiempo" },
  { label: "Próximo a entrega", value: "proximo_entrega" },
  { label: "Pendiente de datos", value: "pendiente_datos" },
  { label: "En pausa", value: "en_pausa" },
  { label: "Finalizado", value: "finalizado" }
];

export function normalizeProjectStage(value: unknown): ProjectStage | null {
  const normalized = normalizeOptionValue(value);

  return (
    PROJECT_STAGE_OPTIONS.find(
      (option) =>
        option.value === normalized ||
        normalizeOptionValue(option.label) === normalized
    )?.value ?? null
  );
}

export function normalizeProjectStatus(value: unknown): ProjectStatus | null {
  const normalized = normalizeOptionValue(value);

  return (
    PROJECT_STATUS_OPTIONS.find(
      (option) =>
        option.value === normalized ||
        normalizeOptionValue(option.label) === normalized
    )?.value ?? null
  );
}

function normalizeOptionValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

