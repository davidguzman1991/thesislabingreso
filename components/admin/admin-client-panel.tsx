"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeDollarSign,
  CalendarClock,
  CircleAlert,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Layers3,
  Users
} from "lucide-react";
import { createAdminClientAction } from "@/app/actions/admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminClientRecord, Installment, PaymentMethod, ServicePlan } from "@/types";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

const planOptions: ServicePlan[] = ["Estandar", "Desarrollo a medida", "Elite"];
const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta_credito", label: "Tarjeta crédito" },
  { value: "tarjeta_debito", label: "Tarjeta débito" }
];

const availableParts = [
  "Tema",
  "Planteamiento del problema",
  "Objetivos",
  "Marco teórico",
  "Metodología",
  "Instrumento",
  "Base de datos",
  "Resultados",
  "Discusión",
  "Correcciones",
  "Diapositivas",
  "Sustentacion"
];

type Draft = {
  nombre: string;
  plan: ServicePlan;
  metodoPago: PaymentMethod;
  precioTotal: string;
  valorEntrada: string;
  cuotas: number;
  fechasPago: string[];
  montosCuotas: string[];
  partesIncluidas: string[];
};

const initialDraft: Draft = {
  nombre: "",
  plan: "Estandar",
  metodoPago: "transferencia",
  precioTotal: "",
  valorEntrada: "",
  cuotas: 3,
  fechasPago: ["", "", ""],
  montosCuotas: ["", "", ""],
  partesIncluidas: []
};

export function AdminClientPanel({
  initialRecords
}: {
  initialRecords: AdminClientRecord[];
}) {
  const [records, setRecords] = useState<AdminClientRecord[]>(initialRecords);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      fechasPago: resizeValues(current.fechasPago, current.cuotas, ""),
      montosCuotas: resizeInstallmentAmounts(
        current.montosCuotas,
        current.cuotas,
        Number(current.precioTotal || 0),
        Number(current.valorEntrada || 0)
      )
    }));
  }, [draft.cuotas]);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      montosCuotas: syncEntryAmount(
        current.montosCuotas,
        Number(current.valorEntrada || 0)
      )
    }));
  }, [draft.valorEntrada]);

  const metrics = useMemo(() => {
    const activeRecords = records.filter((record) =>
      ["activo", "en_pausa"].includes(record.client.estado_cliente)
    );
    const totalContracted = activeRecords.reduce(
      (sum, record) => sum + record.service.precio_total,
      0
    );
    const totalValidated = activeRecords.reduce(
      (sum, record) =>
        sum +
        Math.max(record.service.precio_total - record.service.saldo_pendiente, 0),
      0
    );
    const pendingBalance = activeRecords.reduce(
      (sum, record) => sum + record.service.saldo_pendiente,
      0
    );
    const pendingForms = activeRecords.filter(
      (record) => record.client.estado_formulario === "pendiente"
    ).length;
    const pendingPayments = activeRecords.reduce(
      (sum, record) =>
        sum +
        record.payments.filter((payment) => payment.estado === "reportado")
          .length,
      0
    );

    return [
      {
        label: "Cartera contratada activa",
        value: money.format(totalContracted),
        icon: DollarSign
      },
      {
        label: "Pagos validados",
        value: money.format(totalValidated),
        icon: CreditCard
      },
      {
        label: "Cartera pendiente",
        value: money.format(pendingBalance),
        icon: BadgeDollarSign
      },
      {
        label: "Proyectos activos",
        value: String(activeRecords.length),
        icon: Users
      },
      {
        label: "Pagos por validar",
        value: String(pendingPayments),
        icon: ClipboardCheck
      },
      {
        label: "Formularios pendientes",
        value: String(pendingForms),
        icon: CircleAlert
      }
    ];
  }, [records]);

  const activeRecords = records.filter((record) =>
    ["activo", "en_pausa"].includes(record.client.estado_cliente)
  );
  const archivedRecordsCount = records.length - activeRecords.length;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentErrors = validateDraft(draft);
    setErrors(currentErrors);

    if (currentErrors.length > 0) {
      return;
    }

    const total = Number(draft.precioTotal);
    const entry = Number(draft.valorEntrada);
    const installments = buildInstallments(
      draft.fechasPago,
      draft.montosCuotas,
      draft.cuotas,
      entry
    );

    setIsSaving(true);

    createAdminClientAction({
      nombre_cliente_1: draft.nombre.trim(),
      plan: draft.plan,
      partes_incluidas:
        draft.plan === "Desarrollo a medida" ? draft.partesIncluidas : [],
      metodo_pago: draft.metodoPago,
      precio_total: total,
      valor_entrada: entry,
      numero_cuotas: draft.cuotas,
      installments: installments.map((installment) => ({
        numero_cuota: installment.numero,
        monto: installment.monto,
        fecha_vencimiento: installment.fecha_vencimiento,
        estado: installment.estado === "pagado" ? "pagado" : "pendiente"
      }))
    })
      .then((nextRecord) => {
        setRecords((current) => [nextRecord, ...current]);
        setDraft(initialDraft);
        setErrors([]);
      })
      .catch((error) => {
        setErrors([
          error instanceof Error
            ? error.message
            : "No se pudo crear el cliente en Supabase"
        ]);
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <div className="border-b border-[#1E2D5C] bg-[linear-gradient(135deg,rgba(11,19,43,0.98),rgba(19,31,67,0.96))] px-5 py-5 text-white sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/65">
              Crear cliente
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Alta comercial interna</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/72">
              Genera un cliente real en Supabase con código, token privado y cronograma inicial.
            </p>
          </div>
          <CardContent className="space-y-6">
            {errors.length > 0 ? (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                <p className="text-sm font-semibold text-white">
                  Completa los campos obligatorios antes de crear el cliente.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-300">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nombre cliente"
                  value={draft.nombre}
                  onChange={(value) => updateDraft(setDraft, "nombre", value)}
                  placeholder="Ej. María Fernanda Cedeño"
                />
                <SelectField
                  label="Plan"
                  value={draft.plan}
                  onChange={(value) =>
                    updateDraft(setDraft, "plan", value as ServicePlan)
                  }
                  options={planOptions}
                  labels={{ Estandar: "Estándar", "Desarrollo a medida": "Desarrollo a medida", Elite: "Elite" }}
                />
                <SelectField
                  label="Método de pago"
                  value={draft.metodoPago}
                  onChange={(value) =>
                    updateDraft(setDraft, "metodoPago", value as PaymentMethod)
                  }
                  options={paymentMethodOptions.map((option) => option.value)}
                  labels={Object.fromEntries(
                    paymentMethodOptions.map((option) => [option.value, option.label])
                  )}
                />
                <Field
                  label="Precio total"
                  type="number"
                  value={draft.precioTotal}
                  onChange={(value) => updateDraft(setDraft, "precioTotal", value)}
                  placeholder="980"
                />
                <Field
                  label="Valor de entrada"
                  type="number"
                  value={draft.valorEntrada}
                  onChange={(value) => updateDraft(setDraft, "valorEntrada", value)}
                  placeholder="350"
                />
                <StepperField
                  label="Número de cuotas"
                  value={draft.cuotas}
                  onChange={(value) => updateDraft(setDraft, "cuotas", value)}
                />
              </div>

              <div className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4">
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 size-5 text-[#00E5FF]" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Fechas de pago
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-300">
                      Define la fecha y el valor comprometido por cuota. La primera
                      cuota se alinea con el valor de entrada.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {draft.fechasPago.map((date, index) => {
                    const isEntryInstallment = index === 0;

                    return (
                      <div
                        key={`${index}-${draft.cuotas}`}
                        className="rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4"
                      >
                        <p className="text-sm font-semibold text-white">
                          Cuota {index + 1}
                        </p>
                        <div className="mt-3 grid gap-3">
                          <Field
                            label="Fecha"
                            type="date"
                            value={date}
                            onChange={(value) =>
                              setDraft((current) => ({
                                ...current,
                                fechasPago: current.fechasPago.map((item, itemIndex) =>
                                  itemIndex === index ? value : item
                                )
                              }))
                            }
                          />
                          <Field
                            label={isEntryInstallment ? "Monto de entrada" : "Monto comprometido"}
                            type="number"
                            value={draft.montosCuotas[index] ?? ""}
                            onChange={(value) =>
                              setDraft((current) => ({
                                ...current,
                                montosCuotas: current.montosCuotas.map((item, itemIndex) =>
                                  itemIndex === index ? value : item
                                )
                              }))
                            }
                            placeholder={isEntryInstallment ? "Coincide con la entrada" : "Ej. 175"}
                            disabled={isEntryInstallment}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {draft.plan === "Desarrollo a medida" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-300">
                      Partes incluidas
                    </p>
                    <p className="mt-2 text-sm text-gray-300">
                      Selecciona el alcance que debe quedar asociado a este cliente.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableParts.map((part) => {
                      const selected = draft.partesIncluidas.includes(part);

                      return (
                        <button
                          key={part}
                          type="button"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              partesIncluidas: selected
                                ? current.partesIncluidas.filter((item) => item !== part)
                                : [...current.partesIncluidas, part]
                            }))
                          }
                          className={`rounded-xl border p-4 text-left text-sm font-medium transition duration-200 ${
                            selected
                              ? "border-[#00E5FF] bg-[#00E5FF]/10 text-white shadow-[0_8px_24px_rgba(0,229,255,0.08)]"
                              : "border-[#1E2D5C] bg-[#131F43] text-gray-200 hover:border-[#00E5FF]/35"
                          }`}
                        >
                          {part}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4">
                <p className="text-sm font-semibold text-white">
                  Vista previa operativa
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <PreviewMetric
                    label="Saldo pendiente"
                    value={money.format(
                      Math.max(
                        Number(draft.precioTotal || 0) - Number(draft.valorEntrada || 0),
                        0
                      )
                    )}
                  />
                  <PreviewMetric
                    label="Método de pago"
                    value={getPaymentMethodLabel(draft.metodoPago)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#5C2D91] text-white hover:bg-[#4a2475] sm:w-auto"
              >
                {isSaving ? "Creando cliente..." : "Crear cliente TL"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <Card key={metric.label}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-300">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                      <Icon className="size-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#00E5FF]">Clientes creados</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  Cartera operativa activa
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Lista de clientes activos o en pausa. Los proyectos cerrados y
                  archivados se conservan en Supabase, pero no ocupan espacio operativo.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1E2D5C] bg-[#131F43] px-3 py-2 text-sm text-gray-300">
                <Layers3 className="size-4 text-[#00E5FF]" />
                {activeRecords.length} activos
              </div>
            </div>
            {archivedRecordsCount > 0 ? (
              <p className="mt-3 text-sm text-gray-400">
                {archivedRecordsCount} proyecto(s) cerrado(s) o archivado(s) fuera de esta vista.
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRecords.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#1E2D5C] bg-[#131F43] p-6 text-center text-sm text-gray-300">
                No hay clientes activos en este momento.
              </div>
            ) : null}
            {activeRecords.map((record) => (
              <div
                key={`${record.client.codigo}-${record.client.token}`}
                className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    <ListMetric label="Código" value={record.client.codigo} />
                    <ListMetric label="Cliente" value={record.client.nombre_cliente_1} />
                    <ListMetric label="Plan" value={record.service.plan === "Estandar" ? "Estándar" : record.service.plan} />
                    <ListMetric
                      label="Estado formulario"
                      value={
                        record.client.estado_formulario === "completo"
                          ? "Completo"
                          : "Pendiente"
                      }
                      accent={record.client.estado_formulario === "completo"}
                    />
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                    <Link
                      href={`/admin/clientes/${record.client.codigo}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#0B132B] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-[#00E5FF]/60 hover:bg-[#131F43] lg:w-auto"
                    >
                      Ver detalle operativo
                    </Link>
                    <Link
                      href={`/cliente/${record.client.codigo}?token=${record.client.token}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-[#00E5FF]/60 hover:bg-[#0B132B] lg:w-auto"
                    >
                      Ver portal cliente
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-12 disabled:cursor-not-allowed disabled:bg-[#131F43] disabled:text-gray-400"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  labels
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="space-y-2.5">
      <label>{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StepperField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2.5">
      <label>{label}</label>
      <div className="flex min-h-12 items-center gap-2 rounded-xl border border-[#1E2D5C] bg-[#131F43] p-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex size-9 items-center justify-center rounded-lg border border-[#1E2D5C] text-white transition-colors hover:border-[#00E5FF]/40 hover:bg-[#0B132B]"
        >
          -
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-white">
          {value}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(12, value + 1))}
          className="flex size-9 items-center justify-center rounded-lg border border-[#1E2D5C] text-white transition-colors hover:border-[#00E5FF]/40 hover:bg-[#0B132B]"
        >
          +
        </button>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-300">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function ListMetric({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-300">
        {label}
      </p>
      <p className={`mt-1 text-sm font-medium ${accent ? "text-[#00E5FF]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function updateDraft<TKey extends keyof Draft>(
  setDraft: React.Dispatch<React.SetStateAction<Draft>>,
  key: TKey,
  value: Draft[TKey]
) {
  setDraft((current) => ({
    ...current,
    [key]: value
  }));
}

function resizeValues(currentValues: string[], count: number, fallback = "") {
  const nextValues = currentValues.slice(0, count);

  while (nextValues.length < count) {
    nextValues.push(fallback);
  }

  return nextValues;
}

function resizeInstallmentAmounts(
  currentAmounts: string[],
  count: number,
  precioTotal: number,
  valorEntrada: number
) {
  const nextAmounts = resizeValues(currentAmounts, count, "");
  const remainingInstallments = Math.max(count - 1, 0);
  const remainingAmount = Math.max(precioTotal - valorEntrada, 0);
  const suggestedAmount =
    remainingInstallments > 0
      ? Number((remainingAmount / remainingInstallments).toFixed(2)).toString()
      : "";

  return nextAmounts.map((amount, index) => {
    if (index === 0) {
      return valorEntrada > 0 ? String(valorEntrada) : "";
    }

    return amount || suggestedAmount;
  });
}

function syncEntryAmount(currentAmounts: string[], valorEntrada: number) {
  return currentAmounts.map((amount, index) =>
    index === 0 ? (valorEntrada > 0 ? String(valorEntrada) : "") : amount
  );
}

function validateDraft(draft: Draft) {
  const totalInstallments = draft.montosCuotas.reduce(
    (sum, amount) => sum + Number(amount || 0),
    0
  );
  const errors = [
    draft.nombre.trim() ? "" : "Nombre cliente",
    Number(draft.precioTotal) > 0 ? "" : "Precio total",
    Number(draft.valorEntrada) >= 0 ? "" : "Valor de entrada",
    Number(draft.valorEntrada) <= Number(draft.precioTotal || 0)
      ? ""
      : "La entrada no puede superar el precio total",
    draft.fechasPago.every((date) => date.trim()) ? "" : "Fechas de pago completas",
    draft.montosCuotas.every((amount) => Number(amount) > 0)
      ? ""
      : "Valores de cuota completos",
    Number(draft.montosCuotas[0] || 0) === Number(draft.valorEntrada || 0)
      ? ""
      : "La primera cuota debe coincidir con el valor de entrada",
    Number(totalInstallments.toFixed(2)) === Number(Number(draft.precioTotal || 0).toFixed(2))
      ? ""
      : "La suma de cuotas debe coincidir con el precio total"
  ];

  if (draft.plan === "Desarrollo a medida" && draft.partesIncluidas.length === 0) {
    errors.push("Partes incluidas para Desarrollo a medida");
  }

  return errors.filter(Boolean) as string[];
}

function buildInstallments(
  dates: string[],
  amounts: string[],
  cuotas: number,
  valorEntrada: number
) {
  return dates.slice(0, cuotas).map((date, index): Installment => {
    const amount = Number(amounts[index] || 0);

    return {
      numero: index + 1,
      monto: amount,
      fecha_vencimiento: date,
      estado: index === 0 && valorEntrada > 0 ? "pagado" : "pendiente"
    };
  });
}

function getPaymentMethodLabel(method: PaymentMethod) {
  return (
    paymentMethodOptions.find((option) => option.value === method)?.label ?? method
  );
}
