import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B132B] px-4 py-10 text-gray-200 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-xl border border-[#1E2D5C] bg-[#131F43] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
          <LockKeyhole className="size-6" />
        </div>
        <p className="mt-6 text-sm font-medium text-[#00E5FF]">ThesisLab Ingreso</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Sistema privado de gestión académica
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Acceso restringido para operación interna y seguimiento de proyectos.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#5C2D91] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a2475] focus:outline-none focus:ring-4 focus:ring-[#00E5FF]/15"
        >
          Acceso interno
        </Link>
      </section>
    </main>
  );
}
