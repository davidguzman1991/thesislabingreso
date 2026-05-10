import { Activity, CircleDot } from "lucide-react";
import type { ActivityLog } from "@/types";

export function ActivityTimeline({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-[#1E2D5C] bg-[#131F43] p-4 text-sm text-gray-300">
        Aún no hay actividad registrada para este cliente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3">
          <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#00E5FF]/10 text-[#00E5FF]">
            {log.actor === "admin" ? (
              <Activity className="size-4" />
            ) : (
              <CircleDot className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1 border-b border-[#1E2D5C] pb-4 last:border-b-0 last:pb-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-white">{log.description}</p>
              <p className="text-xs text-gray-400">{formatDateTime(log.created_at)}</p>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
              {log.actor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
