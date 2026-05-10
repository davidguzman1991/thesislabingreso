"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeRegistrationAction } from "@/app/actions/registration";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  ListChecks,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Waypoints,
  UserRound,
  X
} from "lucide-react";
import { FormStepper } from "@/components/client/form-stepper";
import { ServiceSummary } from "@/components/client/service-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Client, RegistrationFormData, ServiceContract } from "@/types";

const steps = [
  {
    title: "Cliente",
    description: "Identidad, contacto y correo de trabajo"
  },
  {
    title: "Académico",
    description: "Universidad, carrera y dirección del proyecto"
  },
  {
    title: "Proyecto",
    description: "Estado actual y fecha límite institucional"
  },
  {
    title: "Formato",
    description: "Citas y extensión esperada del documento"
  },
  {
    title: "Servicio",
    description: "Alcance, pagos y cronograma previamente acordado"
  },
  {
    title: "Condiciones",
    description: "Documentos disponibles y aceptación final"
  }
] as const;

type RegistrationFormProps = {
  codigo: string;
  client: Client;
  service: ServiceContract;
  defaultValues: RegistrationFormData;
};

export function RegistrationForm({
  codigo,
  client,
  service,
  defaultValues
}: RegistrationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>(defaultValues);
  const [showSecondClient, setShowSecondClient] = useState(
    Boolean(
      safeText(defaultValues.client.nombre_cliente_2).trim() ||
        safeText(defaultValues.client.cedula_cliente_2).trim()
    )
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsReady(true), 220);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleNext = () => {
    const currentErrors = validateStep(step, formData);
    setErrors(currentErrors);

    if (currentErrors.length > 0) {
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleBack = () => {
    setErrors([]);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async () => {
    const currentErrors = validateStep(step, formData);
    setErrors(currentErrors);

    if (currentErrors.length > 0) {
      return;
    }

    try {
      await completeRegistrationAction({
        codigo,
        token: client.token,
        formData
      });
      setSubmitted(true);
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "No se pudo guardar el formulario en Supabase"
      ]);
    }
  };

  useEffect(() => {
    if (!submitted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace(`/cliente/${codigo}?token=${client.token}`);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [client.token, codigo, router, submitted]);

  if (submitted) {
    return (
      <div className="grid gap-6">
        <Card className="overflow-hidden border-[#1E2D5C] bg-[#131F43]">
          <div className="bg-[linear-gradient(135deg,rgba(0,229,255,0.12),rgba(92,45,145,0.14))] p-6 sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#00E5FF] text-[#0B132B]">
              <BadgeCheck className="size-6" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-gray-100">
              Tu portal ThesisLab ya está activado
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
              Tu Formulario 2 quedó consolidado. Desde ahora, este mismo enlace
              privado mostrará tu dashboard de seguimiento, pagos y repositorio de
              evidencias.
            </p>
            <p className="mt-2 text-sm font-medium text-[#00E5FF]">
              Redirigiendo automáticamente al portal del cliente...
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/cliente/${codigo}?token=${client.token}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#5C2D91] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#4a2475]"
              >
                Ir al portal
                <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#0B132B] px-4 py-2 text-sm font-medium text-gray-200 transition-colors duration-200 hover:border-[#00E5FF]/60"
              >
                Editar respuestas
              </button>
            </div>
          </div>
        </Card>

      </div>
    );
  }

  if (!isReady) {
    return <RegistrationSkeleton />;
  }

  return (
    <div className="relative grid grid-cols-1 gap-6 pb-20 lg:grid-cols-[2fr_1fr] lg:gap-8 lg:pb-0">
      <div className="grid max-w-3xl gap-6">
        <FormStepper steps={[...steps]} currentStep={step} />

        <Card className="border-[#1E2D5C] bg-[#131F43] shadow-[0_18px_70px_rgba(0,0,0,0.25)]">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#00E5FF]">
                  {steps[step].title}
                </p>
                <h1 className="mt-2 text-xl font-semibold tracking-tight text-gray-100 sm:text-2xl">
                  {getStepHeading(step)}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                  {getStepCopy(step)}
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Completa este bloque con información precisa para evitar retrasos en
                  validación y coordinación académica.
                </p>
              </div>
              <Link
                href={`/cliente/${codigo}?token=${client.token}`}
                className="hidden min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm font-medium text-gray-400 transition-colors hover:text-[#00E5FF] sm:inline-flex"
              >
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {errors.length > 0 ? (
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />
                  <div>
                    <p className="text-sm font-semibold text-gray-100">
                      Completa los campos obligatorios de este paso
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-300">
                      {errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 0 ? (
              <StepClientData
                formData={formData}
                setFormData={setFormData}
                showSecondClient={showSecondClient}
                setShowSecondClient={setShowSecondClient}
              />
            ) : null}
            {step === 1 ? (
              <StepAcademicInfo formData={formData} setFormData={setFormData} />
            ) : null}
            {step === 2 ? (
              <StepProjectState formData={formData} setFormData={setFormData} />
            ) : null}
            {step === 3 ? (
              <StepAcademicFormat formData={formData} setFormData={setFormData} />
            ) : null}
            {step === 4 ? <ServiceSummary service={service} /> : null}
            {step === 5 ? (
              <StepDocumentsAndConditions
                formData={formData}
                setFormData={setFormData}
              />
            ) : null}

            <div className="flex flex-col gap-3 border-t border-[#1E2D5C] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="size-4 text-[#00E5FF]" />
                Guardado local solo para esta sesión
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="min-h-[44px] w-full border-[#1E2D5C] bg-[#0B132B] px-5 text-gray-200 shadow-sm hover:border-[#00E5FF]/60 hover:bg-[#101A38] sm:w-auto"
                >
                  Atrás
                </Button>
                {step < steps.length - 1 ? (
                  <Button onClick={handleNext} className="min-h-[44px] w-full bg-[#5C2D91] text-white hover:bg-[#4a2475] sm:w-auto">
                    Continuar
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="min-h-[44px] w-full bg-[#5C2D91] text-white hover:bg-[#4a2475] sm:w-auto">
                    Confirmar registro
                    <BadgeCheck className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="hidden content-start gap-6 lg:sticky lg:top-6 lg:grid lg:self-start">
        <SummaryPanel
          client={client}
          codigo={codigo}
          formData={formData}
          service={service}
        />
      </aside>

      <button
        type="button"
        onClick={() => setIsSummaryOpen(true)}
        className="fixed inset-x-4 bottom-4 z-40 inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#00E5FF]/40 bg-[#5C2D91] px-5 text-sm font-semibold text-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.42)] transition-[transform,opacity] duration-300 ease-in-out active:scale-[0.98] lg:hidden"
      >
        Ver resumen
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/55 transition-opacity duration-300 ease-in-out lg:hidden",
          isSummaryOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsSummaryOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-3xl border border-[#1E2D5C] bg-[#131F43] p-4 shadow-[0_-24px_70px_rgba(0,0,0,0.48)] transition-transform duration-300 ease-in-out lg:hidden",
          isSummaryOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Resumen del proyecto"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="h-1 w-10 rounded-full bg-[#1E2D5C]" />
          <button
            type="button"
            onClick={() => setIsSummaryOpen(false)}
            className="flex size-11 items-center justify-center rounded-full border border-[#1E2D5C] bg-[#0B132B] text-gray-200 transition-colors hover:border-[#00E5FF]/60"
            aria-label="Cerrar resumen"
          >
            <X className="size-5" />
          </button>
        </div>
        <SummaryPanel
          client={client}
          codigo={codigo}
          formData={formData}
          service={service}
        />
      </div>
    </div>
  );
}

function StepClientData({
  formData,
  setFormData,
  showSecondClient,
  setShowSecondClient
}: StepProps & {
  showSecondClient: boolean;
  setShowSecondClient: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="space-y-6">
      <StepIntro text="Verifica cuidadosamente nombres, cédulas y correos que ThesisLab utilizará en la carpeta privada y en la coordinación del servicio." />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Nombres y apellidos cliente 1"
          value={formData.client.nombre_cliente_1}
          onChange={(value) => updateGroup(setFormData, "client", "nombre_cliente_1", value)}
        />
        <Field
          label="Cédula cliente 1"
          value={formData.client.cedula_cliente_1}
          onChange={(value) => updateGroup(setFormData, "client", "cedula_cliente_1", value)}
        />
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setShowSecondClient((current) => !current)}
            aria-expanded={showSecondClient}
            className="inline-flex min-h-[44px] items-center rounded-xl border border-dashed border-[#1E2D5C] bg-[#0B132B] px-4 py-2 text-sm font-medium text-gray-200 transition-colors duration-200 hover:border-[#00E5FF]/60"
          >
            {showSecondClient
              ? "Ocultar coautor o segundo cliente"
              : "+ Añadir co-autor o segundo cliente"}
          </button>
        </div>
        <div
          aria-hidden={!showSecondClient}
          className={cn(
            "sm:col-span-2 transition-[opacity,transform] duration-300 ease-in-out",
            showSecondClient
              ? "block translate-y-0 opacity-100"
              : "hidden translate-y-2 opacity-0"
          )}
        >
          <div className="grid gap-6 pt-1 sm:grid-cols-2">
            <Field
              label="Nombres y apellidos cliente 2"
              value={formData.client.nombre_cliente_2}
              onChange={(value) =>
                updateGroup(setFormData, "client", "nombre_cliente_2", value)
              }
            />
            <Field
              label="Cédula cliente 2"
              value={formData.client.cedula_cliente_2}
              onChange={(value) =>
                updateGroup(setFormData, "client", "cedula_cliente_2", value)
              }
            />
          </div>
        </div>
        <Field
          label="WhatsApp"
          value={formData.client.whatsapp}
          onChange={(value) => updateGroup(setFormData, "client", "whatsapp", value)}
        />
        <Field
          label="Correo electrónico"
          type="email"
          value={formData.client.email}
          onChange={(value) => updateGroup(setFormData, "client", "email", value)}
        />
        <Field
          label="Correo de Gmail"
          type="email"
          value={formData.client.gmail_drive}
          onChange={(value) => updateGroup(setFormData, "client", "gmail_drive", value)}
          helperText="Se utilizará para compartir el acceso a tu carpeta privada de ThesisLab"
        />
        <Field
          label="Provincia"
          value={formData.client.provincia}
          onChange={(value) => updateGroup(setFormData, "client", "provincia", value)}
        />
        <div className="sm:col-span-2">
          <Field
            label="Ciudad"
            value={formData.client.ciudad}
            onChange={(value) => updateGroup(setFormData, "client", "ciudad", value)}
          />
        </div>
      </div>
    </div>
  );
}

function StepAcademicInfo({
  formData,
  setFormData
}: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro text="Cuanto más precisa sea esta información, mejor podremos estructurar la ruta metodológica y los entregables." />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Universidad"
          value={formData.academic.universidad}
          onChange={(value) => updateGroup(setFormData, "academic", "universidad", value)}
        />
        <Field
          label="Facultad o escuela"
          value={formData.academic.facultad}
          onChange={(value) => updateGroup(setFormData, "academic", "facultad", value)}
        />
        <Field
          label="Carrera"
          value={formData.academic.carrera}
          onChange={(value) => updateGroup(setFormData, "academic", "carrera", value)}
        />
        <SelectField
          label="Nivel"
          value={formData.academic.nivel}
          onChange={(value) =>
            updateGroup(
              setFormData,
              "academic",
              "nivel",
              value as RegistrationFormData["academic"]["nivel"]
            )
          }
          options={[
            { label: "Seleccionar", value: "" },
            { label: "Pregrado", value: "pregrado" },
            { label: "Posgrado", value: "posgrado" }
          ]}
        />
        <SelectField
          label="Tipo de trabajo"
          value={formData.academic.tipo_trabajo}
          onChange={(value) =>
            updateGroup(
              setFormData,
              "academic",
              "tipo_trabajo",
              value as RegistrationFormData["academic"]["tipo_trabajo"]
            )
          }
          options={[
            { label: "Seleccionar", value: "" },
            { label: "Tesis", value: "tesis" },
            { label: "Proyecto de investigación", value: "proyecto de investigacion" },
            { label: "Artículo", value: "articulo" },
            { label: "Revisión bibliográfica", value: "revision bibliografica" },
            { label: "Estudio de caso", value: "estudio de caso" },
            { label: "Otro", value: "otro" }
          ]}
        />
        <Field
          label="Nombre del tutor"
          value={formData.academic.tutor}
          onChange={(value) => updateGroup(setFormData, "academic", "tutor", value)}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            label="Título del trabajo"
            value={formData.academic.titulo}
            onChange={(value) => updateGroup(setFormData, "academic", "titulo", value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

function StepProjectState({
  formData,
  setFormData
}: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro text="Este bloque ayuda a ordenar tiempos, dependencias y posibles alertas dentro del cronograma académico." />
      <BooleanCardGroup
        label="Anteproyecto aprobado"
        value={formData.projectState.anteproyecto_aprobado}
        onChange={(value) =>
          updateGroup(setFormData, "projectState", "anteproyecto_aprobado", value)
        }
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Fecha límite universidad"
          type="date"
          value={formData.projectState.fecha_limite}
          onChange={(value) => updateGroup(setFormData, "projectState", "fecha_limite", value)}
          helperText="Corresponde a la fecha de finalización de la tesis estipulada por tu universidad. Si no la conoces, registra un plazo aproximado. En planes Estándar no aplica como fecha de entrega del servicio: la entrega operativa se mantiene en 15 días y es independiente del plazo universitario."
        />
      </div>
      <BooleanCardGroup
        label="Posee base de datos o se compromete a enviarla"
        value={formData.projectState.base_datos}
        onChange={(value) => updateGroup(setFormData, "projectState", "base_datos", value)}
      />
      <TextAreaField
        label="Observaciones académicas"
        value={formData.projectState.observaciones}
        onChange={(value) => updateGroup(setFormData, "projectState", "observaciones", value)}
        rows={4}
      />
    </div>
  );
}

function StepAcademicFormat({
  formData,
  setFormData
}: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro text="Selecciona el formato base esperado por tu universidad para alinear el trabajo desde el inicio." />
      <OptionTiles
        label="Tipo de citas"
        value={formData.academicFormat.tipo_citas}
        options={["Vancouver", "APA", "Michigan", "Otros"]}
        onChange={(value) =>
          updateGroup(
            setFormData,
            "academicFormat",
            "tipo_citas",
            value as RegistrationFormData["academicFormat"]["tipo_citas"]
          )
        }
      />
      <OptionTiles
        label="Número de páginas"
        value={formData.academicFormat.paginas}
        options={["40-60", "60-80", "80-100", "Más de 100"]}
        onChange={(value) =>
          updateGroup(
            setFormData,
            "academicFormat",
            "paginas",
            value as RegistrationFormData["academicFormat"]["paginas"]
          )
        }
      />
    </div>
  );
}

function StepDocumentsAndConditions({
  formData,
  setFormData
}: StepProps) {
  const requiredDocuments = [
    { label: "Instructivo de tesis", icon: ClipboardList },
    { label: "Guía metodológica", icon: ListChecks },
    { label: "Formato institucional", icon: FileText },
    { label: "Observaciones del tutor", icon: FileCheck2 },
    { label: "Anexos o rúbricas", icon: FileSpreadsheet },
    { label: "Anteproyecto (si aplica)", icon: Waypoints }
  ] as const;

  const conditions = [
    {
      key: "informacion_correcta",
      label: "Declaro que la información entregada es correcta."
    },
    {
      key: "autorizacion_documentos",
      label: "Autorizo el uso de mis documentos para fines del servicio contratado."
    },
    {
      key: "confidencialidad_bilateral",
      label: "Acepto la confidencialidad bilateral."
    },
    {
      key: "acepta_acompanamiento",
      label: "Acepto que ThesisLab brinda asesoría, estructuración y acompañamiento académico."
    },
    {
      key: "responsabilidad_universidad",
      label: "Acepto que la responsabilidad final depende de la universidad."
    },
    {
      key: "condiciones_pago_entregas",
      label: "Acepto condiciones de pago, fechas y entregas."
    }
  ] as const;

  return (
    <div className="space-y-6">
      <StepIntro text="Confirma disponibilidad documental y acepta las condiciones operativas necesarias para activar el servicio." />

      <div className="rounded-xl border border-[#1E2D5C] bg-[#0B132B]/50 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-100">
          Documentación institucional requerida
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          Para garantizar compatibilidad con los requisitos de tu universidad, será
          necesario compartir la documentación institucional disponible.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {requiredDocuments.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[44px] items-center gap-2.5 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-3 py-2.5"
            >
              <item.icon className="size-4 text-[#00E5FF]" />
              <span className="text-sm font-medium text-gray-200">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-4 py-3">
          <p className="text-sm leading-6 text-gray-200">
            Estos archivos deberán ser cargados posteriormente en la carpeta
            privada de Google Drive proporcionada por ThesisLab, utilizando el
            correo Gmail registrado en este formulario.
          </p>
        </div>

        <label className="mt-4 flex min-h-[44px] items-start gap-3 rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4 transition-colors duration-200 hover:border-[#00E5FF]/60">
          <input
            type="checkbox"
            checked={formData.documents.documentos_disponibles === true}
            onChange={(event) =>
              updateGroup(
                setFormData,
                "documents",
                "documentos_disponibles",
                event.target.checked
              )
            }
            className="mt-1 size-4 rounded border-[#1E2D5C] text-[#00E5FF] focus:ring-[#00E5FF]"
          />
          <span className="text-sm leading-6 text-gray-200">
            Me comprometo a compartir la documentación académica disponible para
            facilitar el desarrollo y validación del proyecto.
          </span>
        </label>
      </div>

      <TextAreaField
        label="Observaciones importantes"
        value={formData.documents.observaciones_importantes}
        onChange={(value) =>
          updateGroup(setFormData, "documents", "observaciones_importantes", value)
        }
        rows={4}
      />

      <div className="space-y-3">
        {conditions.map((condition) => (
          <label
            key={condition.key}
            className="flex min-h-[44px] items-start gap-3 rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4 transition-colors duration-200 hover:border-[#00E5FF]/60"
          >
            <input
              type="checkbox"
              checked={formData.conditions[condition.key]}
              onChange={(event) =>
                updateGroup(
                  setFormData,
                  "conditions",
                  condition.key,
                  event.target.checked
                )
              }
              className="mt-1 size-4 rounded border-[#1E2D5C] text-[#00E5FF] focus:ring-[#00E5FF]"
            />
            <span className="text-sm leading-6 text-gray-200">{condition.label}</span>
          </label>
        ))}
        <label className="flex min-h-[44px] items-start gap-3 rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4 transition-colors duration-200 hover:border-[#00E5FF]/60">
          <input
            type="checkbox"
            checked={formData.conditions.acepta_comunicaciones}
            onChange={(event) =>
              updateGroup(
                setFormData,
                "conditions",
                "acepta_comunicaciones",
                event.target.checked
              )
            }
            className="mt-1 size-4 rounded border-[#1E2D5C] text-[#00E5FF] focus:ring-[#00E5FF]"
          />
          <span className="text-sm leading-6 text-gray-200">
            Autorizo recibir información académica, talleres o servicios
            relacionados de ThesisLab.
          </span>
        </label>
      </div>
    </div>
  );
}

type StepProps = {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  helperText
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  helperText?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <input
        type={type}
        value={safeText(value)}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[48px] border-[#1E2D5C] bg-[#0B132B] px-4 text-gray-100 placeholder:text-gray-500 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
      />
      {helperText ? (
        <p className="text-sm leading-5 text-gray-400">{helperText}</p>
      ) : null}
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <textarea
        rows={rows}
        value={safeText(value)}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[48px] border-[#1E2D5C] bg-[#0B132B] px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[48px] border-[#1E2D5C] bg-[#0B132B] px-4 text-gray-100 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function BooleanCardGroup({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-gray-100">
        {label}
      </p>
      <p className="mb-4 text-sm text-gray-400">
        Selecciona la opción que describe mejor tu situación actual.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "min-h-[56px] rounded-xl border p-4 text-left transition-colors duration-200",
              value === option
                ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_24px_rgba(0,229,255,0.14)]"
                : "border-[#1E2D5C] bg-[#0B132B] hover:border-[#00E5FF]/60"
            )}
          >
            <p className="text-sm font-semibold text-gray-100">
              {option ? "Sí" : "No"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionTiles({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
        {label}
      </p>
      <p className="mb-4 text-sm text-gray-400">
        Define aquí la referencia académica esperada para tu entrega.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "min-h-[56px] rounded-xl border p-4 text-left transition-colors duration-200",
              value === option
                ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_24px_rgba(0,229,255,0.14)]"
                : "border-[#1E2D5C] bg-[#0B132B] hover:border-[#00E5FF]/60"
            )}
          >
            <p className="text-sm font-semibold text-gray-100">{option}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function getStepHeading(step: number) {
  switch (step) {
    case 0:
      return "Datos de identificación y contacto";
    case 1:
      return "Información académica del trabajo";
    case 2:
      return "Estado actual del proyecto";
    case 3:
      return "Preferencias de formato académico";
    case 4:
      return "Validación del servicio contratado";
    case 5:
      return "Documentos y condiciones finales";
    default:
      return "";
  }
}

function getStepCopy(step: number) {
  switch (step) {
    case 0:
      return "Verificamos los datos base del cliente y el canal de trabajo para la carpeta privada de ThesisLab.";
    case 1:
      return "Esta información orienta el alcance técnico del acompañamiento y la estructura metodológica.";
    case 2:
      return "Necesitamos contexto operativo para ordenar entregas, insumos y dependencias del proyecto.";
    case 3:
      return "El formato define el estilo editorial y el rango esperado del documento final.";
    case 4:
      return "Esta sección es de solo lectura. El cliente revisa y confirma lo previamente acordado.";
    case 5:
      return "Consolidamos disponibilidad documental, observaciones y aceptaciones necesarias para activar el servicio.";
    default:
      return "";
  }
}

function StepIntro({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-4 py-3.5">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0B132B] text-[#00E5FF] shadow-sm">
        <CircleAlert className="size-4" />
      </div>
      <p className="text-sm leading-6 text-gray-300">{text}</p>
    </div>
  );
}

function SummaryPanel({
  client,
  codigo,
  formData,
  service
}: {
  client: Client;
  codigo: string;
  formData: RegistrationFormData;
  service: ServiceContract;
}) {
  return (
    <Card className="border-[#1E2D5C] bg-[#131F43] shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm font-medium text-[#00E5FF]">Resumen del proyecto</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-100">
            {toTitleCase(client.nombre_cliente_1)}
          </h2>
          <p className="text-sm text-gray-400">
            Código {codigo} · Validación por enlace privado
          </p>
        </div>
        <div className="rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4">
          <p className="text-sm font-medium text-gray-100">Referencia operativa</p>
          <p className="mt-1 text-sm text-gray-400">
            Este panel se actualiza mientras completas el onboarding.
          </p>
          <div className="mt-4 space-y-3">
            <SummaryRow
              icon={UserRound}
              label="Cliente principal"
              value={formData.client.nombre_cliente_1}
            />
            <SummaryRow icon={Phone} label="WhatsApp" value={formData.client.whatsapp} />
            <SummaryRow icon={Mail} label="Correo" value={formData.client.email} />
            <SummaryRow
              icon={MapPin}
              label="Ubicación"
              value={formatLocation(formData.client.provincia, formData.client.ciudad)}
            />
            <SummaryRow
              icon={GraduationCap}
              label="Universidad"
              value={formData.academic.universidad}
            />
            <SummaryRow icon={Sparkles} label="Plan contratado" value={service.plan} />
            <SummaryRow
              icon={CheckCircle2}
              label="Estado del registro"
              value={client.estado_formulario === "completo" ? "Completo" : "Pendiente"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RegistrationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:gap-8">
      <div className="grid max-w-3xl gap-6">
        <div className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-5">
          <div className="h-4 w-48 animate-pulse rounded bg-[#1E2D5C]" />
          <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-[#1E2D5C]" />
          <div className="mt-5 flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={cn(
                  "h-11 animate-pulse rounded-full bg-[#1E2D5C]",
                  item === 0 ? "w-40 flex-1" : "w-11"
                )}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-5 sm:p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-[#1E2D5C]" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-[#1E2D5C]" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-[#1E2D5C]" />
                <div className="h-12 animate-pulse rounded-xl bg-[#1E2D5C]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden rounded-xl border border-[#1E2D5C] bg-[#131F43] p-5 lg:block">
        <div className="h-5 w-40 animate-pulse rounded bg-[#1E2D5C]" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-xl bg-[#1E2D5C]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof UserRound;
  label: string;
  value: string | null | undefined;
}) {
  const normalizedValue = safeText(value).trim();
  const isEmpty = !normalizedValue;

  return (
    <div className="flex min-h-[60px] items-start gap-3 rounded-xl border border-[#1E2D5C] bg-[#131F43] px-3 py-3">
      <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-[#00E5FF]/10 text-[#00E5FF]">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 break-words text-sm",
            isEmpty ? "font-normal text-gray-500" : "font-medium text-gray-100"
          )}
        >
          {isEmpty ? "Sin registrar" : normalizedValue}
        </p>
      </div>
    </div>
  );
}

function formatLocation(provincia: string, ciudad: string) {
  const parts = [safeText(ciudad).trim(), safeText(provincia).trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "";
}

function toTitleCase(value: string | null | undefined) {
  return safeText(value)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function validateStep(step: number, formData: RegistrationFormData) {
  switch (step) {
    case 0:
      return [
        required(formData.client.nombre_cliente_1, "Nombres y apellidos cliente 1"),
        required(formData.client.cedula_cliente_1, "Cédula cliente 1"),
        required(formData.client.whatsapp, "WhatsApp"),
        emailRequired(formData.client.email, "Correo electrónico"),
        emailRequired(formData.client.gmail_drive, "Correo de Gmail"),
        required(formData.client.provincia, "Provincia"),
        required(formData.client.ciudad, "Ciudad")
      ].filter(Boolean) as string[];
    case 1:
      return [
        required(formData.academic.universidad, "Universidad"),
        required(formData.academic.facultad, "Facultad o escuela"),
        required(formData.academic.carrera, "Carrera"),
        required(formData.academic.nivel, "Nivel"),
        required(formData.academic.tipo_trabajo, "Tipo de trabajo"),
        required(formData.academic.tutor, "Nombre del tutor"),
        required(formData.academic.titulo, "Título del trabajo")
      ].filter(Boolean) as string[];
    case 2:
      return [
        requiredBoolean(formData.projectState.anteproyecto_aprobado, "Anteproyecto aprobado"),
        required(formData.projectState.fecha_limite, "Fecha límite universidad"),
        requiredBoolean(
          formData.projectState.base_datos,
          "Posee base de datos o se compromete a enviarla"
        )
      ].filter(Boolean) as string[];
    case 3:
      return [
        required(formData.academicFormat.tipo_citas, "Tipo de citas"),
        required(formData.academicFormat.paginas, "Número de páginas")
      ].filter(Boolean) as string[];
    case 4:
      return [];
    case 5:
      return [
        formData.documents.documentos_disponibles === true
          ? ""
          : "Debes confirmar el compromiso de compartir la documentación académica disponible",
        ...Object.entries(formData.conditions)
          .filter(([key]) => key !== "acepta_comunicaciones")
          .filter(([, value]) => !value)
          .map(() => "Debes aceptar todas las condiciones obligatorias")
          .slice(0, 1)
      ].filter(Boolean) as string[];
    default:
      return [];
  }
}

function required(value: string | null | undefined, label: string) {
  return safeText(value).trim() ? "" : label;
}

function emailRequired(value: string | null | undefined, label: string) {
  const normalized = safeText(value).trim();

  if (!normalized) {
    return label;
  }

  return /\S+@\S+\.\S+/.test(normalized) ? "" : `${label} inválido`;
}

function requiredBoolean(value: boolean | null, label: string) {
  return value === null ? label : "";
}

function updateGroup<
  TGroup extends keyof RegistrationFormData,
  TKey extends keyof RegistrationFormData[TGroup]
>(
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>,
  group: TGroup,
  key: TKey,
  value: RegistrationFormData[TGroup][TKey]
) {
  setFormData((current) => ({
    ...current,
    [group]: {
      ...current[group],
      [key]: value
    }
  }));
}

function safeText(value: string | null | undefined) {
  return value ?? "";
}
