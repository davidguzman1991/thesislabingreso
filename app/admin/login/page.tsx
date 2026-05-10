import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { loginAdminAction } from "@/app/actions/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminLoginPage({
  searchParams
}: {
  searchParams: {
    error?: string;
    next?: string;
  };
}) {
  const hasAdminSession =
    cookies().get(ADMIN_SESSION_COOKIE)?.value === "true";

  if (hasAdminSession) {
    redirect("/admin");
  }

  const nextPath =
    searchParams.next?.startsWith("/admin") &&
    !searchParams.next.startsWith("/admin/login")
      ? searchParams.next
      : "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B132B] px-4 py-10 text-gray-200 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-xl border border-[#1E2D5C] bg-[#131F43] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
          <LockKeyhole className="size-6" />
        </div>
        <p className="mt-6 text-sm font-medium text-[#00E5FF]">ThesisLab Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Acceso interno ThesisLab
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          Área administrativa protegida
        </p>

        <form action={loginAdminAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <div className="space-y-2.5">
            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              required
              className="min-h-12"
            />
          </div>

          {searchParams.error === "pin" ? (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-white">
              PIN incorrecto
            </div>
          ) : null}

          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#5C2D91] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a2475] focus:outline-none focus:ring-4 focus:ring-[#00E5FF]/15"
          >
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}

