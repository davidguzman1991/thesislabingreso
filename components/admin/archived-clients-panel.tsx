"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import {
  deleteArchivedClientAction,
  updateClientLifecycleAction
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { AdminClientRecord } from "@/types";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD"
});

const statusLabels = {
  cerrado: "Cerrado",
  archivado: "Archivado"
} as const;

export function ArchivedClientsPanel({
  records
}: {
  records: AdminClientRecord[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeCode, setActiveCode] = useState("");
  const [confirmations, setConfirmations] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reactivateClient = (codigo: string) => {
    setError("");
    setSuccess("");
    setActiveCode(codigo);

    startTransition(() => {
      updateClientLifecycleAction({ codigo, action: "reactivar" })
        .then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setSuccess(`${codigo} reactivado correctamente.`);
          router.refresh();
        })
        .catch(() => setError("No se pudo reactivar el cliente"))
        .finally(() => setActiveCode(""));
    });
  };

  const deleteClient = (codigo: string) => {
    setError("");
    setSuccess("");
    setActiveCode(codigo);

    startTransition(() => {
      deleteArchivedClientAction({
        codigo,
        confirmation: confirmations[codigo] ?? ""
      })
        .then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setConfirmations((current) => ({ ...current, [codigo]: "" }));
          setSuccess(`${codigo} eliminado definitivamente.`);
          router.refresh();
        })
        .catch(() => setError("No se pudo eliminar definitivamente el cliente"))
        .finally(() => setActiveCode(""));
    });
  };

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#1E2D5C] bg-[#131F43] p-8 text-center">
        <p className="text-lg font-semibold text-white">Archivo vacío</p>
        <p className="mt-2 text-sm text-gray-300">
          Los clientes cerrados o archivados aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-white">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-4 text-sm font-medium text-white">
          {success}
        </div>
      ) : null}

      {records.map((record) => {
        const status =
          record.client.estado_cliente === "archivado" ? "archivado" : "cerrado";
        const isActive = activeCode === record.client.codigo && isPending;
        const confirmation = confirmations[record.client.codigo] ?? "";
        const canDelete = confirmation === record.client.codigo;

        return (
          <section
            key={record.client.codigo}
            className="rounded-xl border border-[#1E2D5C] bg-[#131F43] p-5"
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-[#00E5FF]">
                    {record.client.codigo}
                  </p>
                  <span className="rounded-full border border-[#1E2D5C] bg-[#0B132B] px-3 py-1 text-xs font-medium text-gray-200">
                    {statusLabels[status]}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  {record.client.nombre_cliente_1}
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric label="Plan" value={record.service.plan} />
                  <Metric
                    label="Saldo"
                    value={money.format(record.service.saldo_pendiente)}
                  />
                  <Metric
                    label="Pagos"
                    value={`${record.payments.length} registro(s)`}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    href={`/admin/clientes/${record.client.codigo}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#1E2D5C] bg-[#131F43] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#00E5FF]/60"
                  >
                    Ver detalle
                  </Link>
                  <Button
                    type="button"
                    disabled={isActive}
                    onClick={() => reactivateClient(record.client.codigo)}
                    className="bg-[#00E5FF] text-[#0B132B] hover:bg-[#00E5FF]/80"
                  >
                    <RotateCcw className="size-4" />
                    Reactivar
                  </Button>
                </div>

                <div className="border-t border-[#1E2D5C] pt-3">
                  <p className="text-xs leading-5 text-gray-400">
                    Eliminación definitiva. Escribe el código para confirmar.
                  </p>
                  <input
                    value={confirmation}
                    onChange={(event) =>
                      setConfirmations((current) => ({
                        ...current,
                        [record.client.codigo]: event.target.value.trim()
                      }))
                    }
                    placeholder={record.client.codigo}
                    className="mt-3 min-h-11"
                  />
                  <Button
                    type="button"
                    disabled={isActive || !canDelete}
                    onClick={() => deleteClient(record.client.codigo)}
                    className="mt-3 w-full border border-red-400/30 bg-red-500/15 text-red-100 hover:bg-red-500/25"
                  >
                    <Trash2 className="size-4" />
                    Eliminar definitivamente
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
