import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Activity,
  Archive,
  CheckCircle2,
  CreditCard,
  FileJson2,
  FolderKanban,
  GraduationCap,
  HardDrive,
  ListChecks,
  Sparkles,
  UserRound
} from "lucide-react";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { ClientLifecyclePanel } from "@/components/admin/client-lifecycle-panel";
import { CopyJsonButton } from "@/components/admin/copy-json-button";
import { DriveManagementForm } from "@/components/admin/drive-management-form";
import { PaymentValidationPanel } from "@/components/admin/payment-validation-panel";
import { ProjectProgressForm } from "@/components/admin/project-progress-form";
import { DocumentCenterBeta } from "@/components/document-center/document-center-beta";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ClientPortalData } from "@/lib/data";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

const paymentMethodLabels = {
  transferencia: "Transferencia",
  tarjeta_credito: "Tarjeta crédito",
  tarjeta_debito: "Tarjeta débito"
} as const;

const installmentStatusLabels = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  vencido: "Vencido"
} as const;

export function AdminClientDetail({ data }: { data: ClientPortalData }) {
  const totalPaid = Math.max(
    data.service.precio_total - data.service.saldo_pendiente,
    0
  );
  const technicalPayload = {
    client: data.client,
    project: data.project,
    service: data.service,
    payments: data.payments,
    activityLogs: data.activityLogs
  };

  return (
    <main className="min-h-screen bg-[#0B132B] px-4 py-8 text-gray-200 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Volver al panel
            </Link>
            <p className="mt-4 text-sm font-medium text-[#00E5FF]">Cliente operativo</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {data.client.codigo}
            </h1>
            <p className="mt-2 text-sm text-gray-300">
              Vista interna consolidada para operación, seguimiento financiero y
              automatización.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CopyJsonButton value={JSON.stringify(technicalPayload, null, 2)} />
            <DocumentCenterBeta />
            <AdminLogoutButton />
            <Link
              href={`/cliente/${data.client.codigo}?token=${data.client.token}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-[#00E5FF]/60 hover:bg-[#0B132B]"
            >
              Ver portal cliente
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TopMetric label="Cliente" value={data.client.nombre_cliente_1} icon={UserRound} />
          <TopMetric label="Estado formulario" value={toRegistrationLabel(data.client.estado_formulario)} icon={CheckCircle2} />
          <TopMetric label="Estado cliente" value={toClientStatusLabel(data.client.estado_cliente)} icon={Archive} />
          <TopMetric label="Plan" value={data.service.plan === "Estandar" ? "Estándar" : data.service.plan} icon={Sparkles} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid content-start gap-6">
            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Cliente"
                  title="Datos completos"
                  icon={UserRound}
                />
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <DetailMetric label="Código" value={data.client.codigo} />
                <DetailMetric label="Token privado" value={data.client.token} mono />
                <DetailMetric label="Cliente 1" value={data.client.nombre_cliente_1} />
                <DetailMetric label="Cédula 1" value={data.client.cedula_cliente_1} />
                <DetailMetric label="Cliente 2" value={data.client.nombre_cliente_2 || "No registrado"} />
                <DetailMetric label="Cédula 2" value={data.client.cedula_cliente_2 || "No registrada"} />
                <DetailMetric label="WhatsApp" value={data.client.whatsapp || "No registrado"} />
                <DetailMetric label="Correo" value={data.client.email || "No registrado"} />
                <DetailMetric label="Gmail Drive" value={data.client.gmail_drive || "No registrado"} />
                <DetailMetric
                  label="Ubicacion"
                  value={formatLocation(data.client.ciudad, data.client.provincia)}
                />
                <DetailMetric
                  label="Estado del registro"
                  value={toRegistrationLabel(data.client.estado_formulario)}
                />
                <DetailMetric
                  label="Estado cliente"
                  value={toClientStatusLabel(data.client.estado_cliente)}
                />
                <DetailMetric
                  label="Acepta comunicaciones"
                  value={data.client.acepta_comunicaciones ? "Sí" : "No"}
                />
                <DetailMetric
                  label="Fecha cierre"
                  value={formatDate(data.client.closed_at)}
                />
                <DetailMetric
                  label="Fecha archivo"
                  value={formatDate(data.client.archived_at)}
                />
                <DetailMetric
                  label="Drive privado"
                  value={data.client.drive_url || "Pendiente"}
                />
                <DetailMetric
                  label="Estado Drive"
                  value={toDriveStatusLabel(data.client.drive_estado)}
                />
                <DetailMetric
                  label="Confirmado por cliente"
                  value={data.client.drive_confirmado_cliente ? "Sí" : "No"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Cierre"
                  title="Cierre del proyecto"
                  icon={Archive}
                />
              </CardHeader>
              <CardContent>
                <ClientLifecyclePanel client={data.client} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Drive"
                  title="Gestión Drive"
                  icon={HardDrive}
                />
              </CardHeader>
              <CardContent>
                <DriveManagementForm client={data.client} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Avance"
                  title="Gestión del avance"
                  icon={ListChecks}
                />
              </CardHeader>
              <CardContent>
                <ProjectProgressForm
                  codigo={data.client.codigo}
                  project={data.project}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Proyecto"
                  title="Información académica"
                  icon={GraduationCap}
                />
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <DetailMetric label="Universidad" value={data.project.universidad || "Pendiente"} />
                <DetailMetric label="Facultad" value={data.project.facultad || "Pendiente"} />
                <DetailMetric label="Carrera" value={data.project.carrera || "Pendiente"} />
                <DetailMetric label="Nivel" value={capitalize(data.project.nivel)} />
                <DetailMetric label="Tipo de trabajo" value={capitalize(data.project.tipo_trabajo)} />
                <DetailMetric label="Tutor" value={data.project.tutor || "Pendiente"} />
                <div className="sm:col-span-2">
                  <DetailMetric label="Título" value={data.project.titulo || "Pendiente"} />
                </div>
                <DetailMetric
                  label="Anteproyecto aprobado"
                  value={data.project.anteproyecto_aprobado ? "Sí" : "No"}
                />
                <DetailMetric
                  label="Base de datos"
                  value={data.project.base_datos ? "Sí" : "No"}
                />
                <DetailMetric label="Fecha límite" value={data.project.fecha_limite || "Pendiente"} />
                <DetailMetric label="Tipo de citas" value={data.project.tipo_citas} />
                <DetailMetric label="Páginas" value={data.project.paginas} />
                <div className="sm:col-span-2">
                  <DetailMetric
                    label="Observaciones"
                    value={data.project.observaciones || "Sin observaciones"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid content-start gap-6">
            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Servicio"
                  title="Contrato y cronograma"
                  icon={FolderKanban}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailMetric label="Plan" value={data.service.plan === "Estandar" ? "Estándar" : data.service.plan} />
                  <DetailMetric
                    label="Método de pago"
                    value={paymentMethodLabels[data.service.metodo_pago]}
                  />
                  <DetailMetric
                    label="Precio total"
                    value={money.format(data.service.precio_total)}
                  />
                  <DetailMetric
                    label="Valor de entrada"
                    value={money.format(data.service.valor_entrada)}
                  />
                  <DetailMetric
                    label="Total pagado"
                    value={money.format(totalPaid)}
                  />
                  <DetailMetric
                    label="Saldo pendiente"
                    value={money.format(data.service.saldo_pendiente)}
                  />
                  <DetailMetric label="Cuotas" value={String(data.service.cuotas)} />
                </div>

                {data.service.partes_incluidas.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Partes incluidas
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {data.service.partes_incluidas.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-[#1E2D5C] bg-[#131F43] px-3 py-2 text-sm text-gray-200"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm font-semibold text-white">Cuotas</p>
                  <div className="mt-3 space-y-3">
                    {data.service.fechas_pago.map((installment) => (
                      <div
                        key={installment.numero}
                        className="flex flex-col gap-2 rounded-xl border border-[#1E2D5C] bg-[#131F43] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            Cuota {installment.numero}
                          </p>
                          <p className="text-sm text-gray-300">
                            Vence el {installment.fecha_vencimiento}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-semibold text-white">
                            {money.format(installment.monto)}
                          </p>
                          {typeof installment.monto_original === "number" &&
                          installment.monto_original !== installment.monto ? (
                            <p className="text-xs text-gray-300">
                              Recalculada desde {money.format(installment.monto_original)}
                            </p>
                          ) : null}
                          <p className="text-xs uppercase tracking-[0.14em] text-gray-300">
                            {installmentStatusLabels[installment.estado]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Pagos"
                  title="Validación de pagos"
                  icon={CreditCard}
                />
              </CardHeader>
              <CardContent>
                <PaymentValidationPanel
                  codigo={data.client.codigo}
                  payments={data.payments}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="Auditoría"
                  title="Actividad reciente"
                  icon={Activity}
                />
              </CardHeader>
              <CardContent>
                <ActivityTimeline logs={data.activityLogs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  eyebrow="JSON técnico"
                  title="Payload operativo estructurado"
                  icon={FileJson2}
                />
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-xl bg-[#0B132B] px-4 py-4 text-xs leading-6 text-white sm:text-sm">
                  {JSON.stringify(technicalPayload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
  icon: Icon
}: {
  eyebrow: string;
  title: string;
  icon: typeof UserRound;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#00E5FF]">{eyebrow}</p>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
    </div>
  );
}

function TopMetric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof UserRound;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-300">{label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{value}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailMetric({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-300">
        {label}
      </p>
      <p
        className={`mt-2 break-words text-sm font-medium text-white ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function toRegistrationLabel(value: "pendiente" | "completo") {
  return value === "completo" ? "Completo" : "Pendiente";
}

function toDriveStatusLabel(value: "pendiente" | "compartido" | "activo") {
  const labels = {
    pendiente: "Pendiente",
    compartido: "Compartido",
    activo: "Activo"
  };

  return labels[value];
}

function toClientStatusLabel(value: "activo" | "en_pausa" | "cerrado" | "archivado") {
  const labels = {
    activo: "Activo",
    en_pausa: "En pausa",
    cerrado: "Cerrado",
    archivado: "Archivado"
  };

  return labels[value];
}

function formatDate(value?: string) {
  if (!value) {
    return "No aplica";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatLocation(ciudad: string, provincia: string) {
  return [ciudad, provincia].filter(Boolean).join(", ") || "Pendiente";
}

function capitalize(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}
