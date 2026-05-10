import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ServiceContract } from "@/types";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

export function FinancialSnapshot({
  service,
  codigo,
  token
}: {
  service: ServiceContract;
  codigo: string;
  token?: string;
}) {
  const nextInstallment = service.fechas_pago.find(
    (installment) => installment.estado === "pendiente"
  );
  const totalPaid = Math.max(service.precio_total - service.saldo_pendiente, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#00E5FF]">Financial Snapshot</p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Estado financiero
            </h2>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#5C2D91] text-white">
            <CreditCard className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-4">
          <p className="text-sm font-medium text-gray-300">
            Mantén tus pagos al día para evitar retrasos en tu entrega.
          </p>
          <Link
            href={`/cliente/${codigo}/pagos${token ? `?token=${token}` : ""}`}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#5C2D91] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#4a2475] focus:outline-none focus:ring-4 focus:ring-[#00E5FF]/15"
          >
            Registrar pago
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Plan contratado" value={service.plan} />
          <Metric label="Precio total" value={money.format(service.precio_total)} />
          <Metric label="Entrada inicial" value={money.format(service.valor_entrada)} />
          <Metric label="Total pagado" value={money.format(totalPaid)} />
          <Metric label="Saldo pendiente" value={money.format(service.saldo_pendiente)} strong />
          <Metric
            label="Próxima cuota"
            value={nextInstallment ? money.format(nextInstallment.monto) : "Sin cuotas"}
          />
          <Metric
            label="Fecha de vencimiento"
            value={nextInstallment?.fecha_vencimiento ?? "No aplica"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  strong = false
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4">
      <p className="text-xs font-medium uppercase text-gray-300">{label}</p>
      <p className={`mt-2 text-base font-semibold ${strong ? "text-amber-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
