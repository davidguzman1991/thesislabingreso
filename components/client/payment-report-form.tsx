"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { reportPaymentAction } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/types";

const methods: { label: string; value: PaymentMethod }[] = [
  { label: "Transferencia", value: "transferencia" },
  { label: "Tarjeta crédito", value: "tarjeta_credito" },
  { label: "Tarjeta débito", value: "tarjeta_debito" }
];

export function PaymentReportForm({
  codigo,
  token
}: {
  codigo: string;
  token: string;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    monto: "",
    fecha_pago: "",
    metodo: "transferencia" as PaymentMethod,
    comprobante_url: "",
    observacion: ""
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.monto || Number(formData.monto) <= 0 || !formData.fecha_pago) {
      setError("Ingresa monto y fecha de pago válidos.");
      return;
    }

    setIsSaving(true);

    reportPaymentAction({
      codigo,
      token,
      monto: Number(formData.monto),
      fecha_pago: formData.fecha_pago,
      metodo: formData.metodo,
      comprobante_url: formData.comprobante_url,
      observacion: formData.observacion
    })
      .then(() => {
        setSuccess(true);
        setFormData({
          monto: "",
          fecha_pago: "",
          metodo: "transferencia",
          comprobante_url: "",
          observacion: ""
        });
        router.refresh();
      })
      .catch((submitError) => {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "No se pudo registrar el pago."
        );
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-white">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-4 text-sm font-medium text-white">
          <BadgeCheck className="size-4 text-[#00E5FF]" />
          Pago reportado. ThesisLab lo validará manualmente.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2.5">
          <label>Monto</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.monto}
            onChange={(event) =>
              setFormData((current) => ({ ...current, monto: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2.5">
          <label>Fecha de pago</label>
          <input
            type="date"
            value={formData.fecha_pago}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                fecha_pago: event.target.value
              }))
            }
          />
        </div>
        <div className="space-y-2.5">
          <label>Método</label>
          <select
            value={formData.metodo}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                metodo: event.target.value as PaymentMethod
              }))
            }
          >
            {methods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2.5">
          <label>Referencia del comprobante</label>
          <p className="text-sm leading-5 text-gray-300">
            Sube tu comprobante a la carpeta Drive compartida por ThesisLab y escribe
            aquí el nombre del archivo o una breve referencia.
          </p>
          <input
            value={formData.comprobante_url}
            placeholder="Ej. Transferencia Banco Pichincha 09/05/2026"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                comprobante_url: event.target.value
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <label>Observación opcional</label>
        <textarea
          rows={4}
          value={formData.observacion}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              observacion: event.target.value
            }))
          }
        />
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full bg-[#5C2D91] text-white hover:bg-[#4a2475] sm:w-auto"
      >
        {isSaving ? "Registrando pago..." : "Registrar pago"}
      </Button>
    </form>
  );
}
