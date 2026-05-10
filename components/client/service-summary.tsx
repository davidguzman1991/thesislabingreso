import { CalendarDays, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ServiceContract } from "@/types";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

const methodLabel = {
  transferencia: "Transferencia",
  tarjeta_credito: "Tarjeta crédito",
  tarjeta_debito: "Tarjeta débito"
};

export function ServiceSummary({ service }: { service: ServiceContract }) {
  return (
    <Card className="border-[#1E2D5C] bg-[#0B132B]/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#00E5FF]">Servicio contratado</p>
            <h3 className="mt-1 text-xl font-semibold text-gray-100">
              Resumen económico y alcance
            </h3>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#5C2D91] text-gray-100">
            <Sparkles className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryMetric label="Plan contratado" value={service.plan} icon={Sparkles} />
          <SummaryMetric
            label="Forma de pago"
            value={methodLabel[service.metodo_pago]}
            icon={CreditCard}
          />
          <SummaryMetric label="Número de cuotas" value={String(service.cuotas)} icon={CalendarDays} />
          <SummaryMetric
            label="Valor de entrada"
            value={money.format(service.valor_entrada)}
            icon={CreditCard}
          />
          <SummaryMetric
            label="Saldo pendiente"
            value={money.format(service.saldo_pendiente)}
            icon={CreditCard}
          />
          <SummaryMetric
            label="Precio total"
            value={money.format(service.precio_total)}
            icon={CreditCard}
          />
        </div>

        {service.plan === "Desarrollo a medida" ? (
          <div>
            <p className="text-sm font-semibold text-gray-100">Partes incluidas</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {service.partes_incluidas.map((item) => (
                <div
                  key={item}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#1E2D5C] bg-[#131F43] px-3 py-2"
                >
                  <CheckCircle2 className="size-4 text-[#00E5FF]" />
                  <span className="text-sm text-gray-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-sm font-semibold text-gray-100">Fechas de pago</p>
          <div className="mt-3 space-y-2">
            {service.fechas_pago.map((installment) => (
              <div
                key={installment.numero}
                className="flex min-h-[64px] items-center justify-between rounded-xl border border-[#1E2D5C] bg-[#131F43] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-100">
                    Cuota {installment.numero}
                  </p>
                  <p className="text-sm text-gray-400">
                    Vence el {installment.fecha_vencimiento}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-100">
                    {money.format(installment.monto)}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {installment.estado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryMetric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof Sparkles;
}) {
  return (
    <div className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-4">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon className="size-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-base font-semibold text-gray-100">{value}</p>
    </div>
  );
}
