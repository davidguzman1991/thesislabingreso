"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  approvePaymentAction,
  rejectPaymentAction
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

const methodLabels: Record<Payment["metodo"], string> = {
  transferencia: "Transferencia",
  tarjeta_credito: "Tarjeta crédito",
  tarjeta_debito: "Tarjeta débito"
};

const statusLabels: Record<Payment["estado"], string> = {
  reportado: "Reportado",
  aprobado: "Aprobado",
  rechazado: "Rechazado"
};

export function PaymentValidationPanel({
  codigo,
  payments
}: {
  codigo: string;
  payments: Payment[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activePaymentId, setActivePaymentId] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const validatePayment = (
    paymentId: string,
    decision: "aprobado" | "rechazado"
  ) => {
    setError("");
    setActivePaymentId(paymentId);

    startTransition(() => {
      const action =
        decision === "aprobado"
          ? approvePaymentAction({ codigo, paymentId })
          : rejectPaymentAction({
              codigo,
              paymentId,
              rejectionReason: rejectionReasons[paymentId] ?? ""
            });

      action
        .then(() => {
          setRejectionReasons((current) => ({ ...current, [paymentId]: "" }));
          router.refresh();
        })
        .catch((submitError) => {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "No se pudo validar el pago."
          );
        })
        .finally(() => setActivePaymentId(""));
    });
  };

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-[#1E2D5C] bg-[#131F43] p-4 text-sm text-gray-300">
        Aún no hay pagos reportados para este cliente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-white">
          {error}
        </div>
      ) : null}

      {payments.map((payment) => {
        const canValidate = payment.estado === "reportado";
        const isActive = activePaymentId === payment.id && isPending;

        return (
          <section
            key={payment.id}
            className="rounded-lg border border-[#1E2D5C] bg-[#131F43] p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Info label="Monto" value={money.format(payment.monto)} strong />
                <Info label="Estado actual" value={statusLabels[payment.estado]} />
                <Info label="Fecha de pago" value={payment.fecha_pago} />
                <Info label="Método" value={methodLabels[payment.metodo]} />
                <Info
                  label="Referencia comprobante"
                  value={payment.comprobante_url || "Sin referencia registrada"}
                />
                <Info
                  label="Fecha reporte"
                  value={formatDateTime(payment.created_at)}
                />
                {payment.validated_at ? (
                  <Info
                    label="Validado"
                    value={`${formatDateTime(payment.validated_at)} · ${payment.validated_by ?? "admin"}`}
                  />
                ) : null}
                {payment.rejection_reason ? (
                  <Info label="Motivo rechazo" value={payment.rejection_reason} />
                ) : null}
              </div>

              {canValidate ? (
                <div className="w-full space-y-3 lg:w-72">
                  <textarea
                    rows={3}
                    value={rejectionReasons[payment.id] ?? ""}
                    onChange={(event) =>
                      setRejectionReasons((current) => ({
                        ...current,
                        [payment.id]: event.target.value
                      }))
                    }
                    placeholder="Motivo si se rechaza"
                  />
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <Button
                      onClick={() => validatePayment(payment.id, "aprobado")}
                      disabled={isActive}
                      className="bg-[#5C2D91] text-white hover:bg-[#4a2475]"
                    >
                      <CheckCircle2 className="size-4" />
                      Aprobar pago
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => validatePayment(payment.id, "rechazado")}
                      disabled={isActive}
                      className="border-[#1E2D5C] bg-[#0B132B] text-white hover:border-amber-300/60 hover:bg-[#131F43]"
                    >
                      <XCircle className="size-4" />
                      Rechazar pago
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Info({
  label,
  value,
  strong = false
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm ${strong ? "font-semibold text-white" : "font-medium text-gray-200"}`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
