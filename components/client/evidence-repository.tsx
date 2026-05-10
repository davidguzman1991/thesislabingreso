"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, ExternalLink, FolderOpen } from "lucide-react";
import { confirmClientDriveAccessAction } from "@/app/actions/drive";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Client, Project } from "@/types";

const driveStatusLabel: Record<Client["drive_estado"], string> = {
  pendiente: "Pendiente de asignación",
  compartido: "Compartida por ThesisLab",
  activo: "Acceso confirmado por cliente"
};

export function EvidenceRepository({
  client,
  project
}: {
  client: Client;
  project: Project;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const status = client.drive_confirmado_cliente ? "activo" : client.drive_estado;
  const canConfirm = client.drive_estado === "compartido" && !client.drive_confirmado_cliente;

  const handleConfirm = () => {
    setError("");
    startTransition(() => {
      confirmClientDriveAccessAction({
        codigo: client.codigo,
        token: client.token
      }).catch((confirmError) => {
        setError(
          confirmError instanceof Error
            ? confirmError.message
            : "No se pudo confirmar el acceso a Drive."
        );
      });
    });
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
              <FolderOpen className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#00E5FF]">Repositorio de evidencias</p>
              <h2 className="text-lg font-semibold text-white">
                Carpeta privada de trabajo
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Tu documentación será gestionada mediante una carpeta privada de
                Google Drive compartida por ThesisLab.
              </p>
              <p className="mt-3 text-sm font-medium text-white">
                Recibirás el acceso en el correo Gmail registrado:{" "}
                <span className="break-all">{client.gmail_drive || "Sin registrar"}</span>
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#1E2D5C] bg-[#131F43] px-3 py-1.5 text-sm font-medium text-white">
                <CheckCircle2 className="size-4 text-[#00E5FF]" />
                {driveStatusLabel[status]}
              </div>
              {error ? (
                <p className="mt-3 text-sm font-medium text-amber-300">{error}</p>
              ) : null}
            </div>
          </div>
          {canConfirm ? (
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="w-full bg-[#5C2D91] text-white hover:bg-[#4a2475] sm:w-auto"
            >
              {isPending
                ? "Confirmando..."
                : "Confirmo que ya recibí acceso a mi carpeta compartida"}
            </Button>
          ) : project.drive_url && status === "activo" ? (
            <Link
              href={project.drive_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-[#00E5FF]/60 hover:bg-[#0B132B] sm:w-auto"
            >
              Abrir carpeta
              <ExternalLink className="size-4" />
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
