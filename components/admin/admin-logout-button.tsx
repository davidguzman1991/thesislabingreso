import { LogOut } from "lucide-react";
import { logoutAdminAction } from "@/app/actions/admin-auth";

export function AdminLogoutButton() {
  return (
    <form action={logoutAdminAction}>
      <button
        type="submit"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#131F43] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#00E5FF]/60 hover:bg-[#0B132B]"
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </button>
    </form>
  );
}

