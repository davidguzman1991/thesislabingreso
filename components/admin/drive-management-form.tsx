"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { updateClientDriveAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { Client, DriveStatus } from "@/types";

const driveStatusOptions: { value: DriveStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "compartido", label: "Compartido" },
  { value: "activo", label: "Activo" }
];

export function DriveManagementForm({ client }: { client: Client }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    drive_url: client.drive_url ?? "",
    drive_estado: client.drive_estado,
    drive_compartido_at: toDateTimeLocal(client.drive_compartido_at),
    drive_observaciones: client.drive_observaciones ?? ""
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(() => {
      updateClientDriveAction({
        codigo: client.codigo,
        drive_url: formData.drive_url,
        drive_estado: formData.drive_estado,
        drive_compartido_at: formData.drive_compartido_at,
        drive_observaciones: formData.drive_observaciones
      })
        .then((result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }

          setSuccess(true);
          router.refresh();
        })
        .catch(() => {
          setError("No se pudo actualizar la gestión Drive.");
        });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ReadOnlyMetric label="Gmail cliente" value={client.gmail_drive || "No registrado"} />
        <ReadOnlyMetric
          label="Confirmación cliente"
          value={client.drive_confirmado_cliente ? "Confirmado" : "Pendiente"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2.5 sm:col-span-2">
          <label>URL de carpeta Drive</label>
          <input
            value={formData.drive_url}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                drive_url: event.target.value
              }))
            }
            placeholder="https://drive.google.com/..."
          />
        </div>
        <div className="space-y-2.5">
          <label>Estado Drive</label>
          <select
            value={formData.drive_estado}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                drive_estado: event.target.value as DriveStatus
              }))
            }
          >
            {driveStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2.5">
          <label>Fecha de envío o compartido</label>
          <input
            type="datetime-local"
            value={formData.drive_compartido_at}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                drive_compartido_at: event.target.value
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <label>Observaciones internas</label>
        <textarea
          rows={4}
          value={formData.drive_observaciones}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              drive_observaciones: event.target.value
            }))
          }
          placeholder="Ej. Carpeta compartida con permisos de editor."
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-white">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-4 text-sm font-medium text-white">
          <BadgeCheck className="size-4 text-[#00E5FF]" />
          Gestión Drive actualizada.
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#5C2D91] text-white hover:bg-[#4a2475] sm:w-auto"
      >
        {isPending ? "Guardando..." : "Guardar gestión Drive"}
      </Button>
    </form>
  );
}

function ReadOnlyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1E2D5C] bg-[#0B132B] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-300">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function toDateTimeLocal(value?: string) {
  return value ? value.slice(0, 16) : "";
}
