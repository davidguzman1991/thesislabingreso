import { ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Payment } from "@/types";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

const methodLabel: Record<Payment["metodo"], string> = {
  transferencia: "Transferencia",
  tarjeta_credito: "Tarjeta crédito",
  tarjeta_debito: "Tarjeta débito"
};

const statusTone: Record<Payment["estado"], "accent" | "alert" | "pending"> = {
  aprobado: "accent",
  reportado: "alert",
  rechazado: "pending"
};

const statusLabel: Record<Payment["estado"], string> = {
  reportado: "En revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado"
};

export function RecentPayments({ payments }: { payments: Payment[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#00E5FF]">Pagos recientes</p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Seguimiento de comprobantes
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Consulta aquí el estado de tus reportes y la validación manual de cada pago.
            </p>
          </div>
          <ReceiptText className="size-5 text-gray-300" />
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#1E2D5C] bg-[#131F43] p-6 text-center">
            <p className="text-sm text-gray-300">
              Cuando reportes un pago, aparecerá aquí para seguimiento.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {money.format(payment.monto)}
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                      {methodLabel[payment.metodo]} · {payment.fecha_pago}
                    </p>
                  </div>
                  <Badge tone={statusTone[payment.estado]}>
                    {statusLabel[payment.estado]}
                  </Badge>
                </div>
                <p className="mt-4 text-sm font-medium text-white">
                  Referencia: {payment.comprobante_url || "Sin referencia registrada"}
                </p>
                {payment.estado === "rechazado" && payment.rejection_reason ? (
                  <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-gray-200">
                    Motivo: {payment.rejection_reason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
