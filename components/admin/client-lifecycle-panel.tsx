"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, CheckCircle2, RotateCcw } from "lucide-react";
import { updateClientLifecycleAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types";

const statusLabels: Record<Client["estado_cliente"], string> = {
  activo: "Activo",
  en_pausa: "En pausa",
  cerrado: "Cerrado",
  archivado: "Archivado"
};

export function ClientLifecyclePanel({ client }: { client: Client }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const runAction = (action: "cerrar" | "archivar" | "reactivar") => {
    setError("");
    setSuccess("");

    startTransition(() => {
      updateClientLifecycleAction({
        codigo: client.codigo,
        action
      })
        .then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setSuccess("Estado del cliente actualizado");
          router.refresh();
        })
        .catch(() => {
          setError("No se pudo actualizar el estado del cliente");
        });
    });
  };

  const isClosed = client.estado_cliente === "cerrado";
  const isArchived = client.estado_cliente === "archivado";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-300">
          Estado actual
        </p>
        <p className="mt-2 text-lg font-semibold text-white">
          {statusLabels[client.estado_cliente]}
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          El cierre conserva historial financiero y deja el proyecto en entrega
          final. El archivo restringe la vista activa sin borrar información.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-white">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-4 text-sm font-medium text-white">
          <CheckCircle2 className="size-4 text-[#00E5FF]" />
          {success}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Button
          type="button"
          disabled={isPending || isClosed}
          onClick={() => runAction("cerrar")}
          className="bg-[#5C2D91] text-white hover:bg-[#4a2475]"
        >
          <CheckCircle2 className="mr-2 size-4" />
          Marcar como cerrado
        </Button>
        <Button
          type="button"
          disabled={isPending || isArchived}
          onClick={() => runAction("archivar")}
          className="bg-[#131F43] text-white hover:bg-[#0B132B]"
        >
          <Archive className="mr-2 size-4" />
          Archivar cliente
        </Button>
        <Button
          type="button"
          disabled={isPending || client.estado_cliente === "activo"}
          onClick={() => runAction("reactivar")}
          className="bg-[#00E5FF] text-[#0B132B] hover:bg-[#00E5FF]/80"
        >
          <RotateCcw className="mr-2 size-4" />
          Reactivar cliente
        </Button>
      </div>
    </div>
  );
}
