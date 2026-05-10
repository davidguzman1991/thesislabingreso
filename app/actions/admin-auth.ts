"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE
} from "@/lib/admin-auth";

export async function loginAdminAction(formData: FormData) {
  const pin = String(formData.get("pin") ?? "").trim();
  const nextPath = normalizeAdminPath(String(formData.get("next") ?? "/admin"));
  const adminPin = process.env.ADMIN_PIN;

  if (!adminPin || pin !== adminPin) {
    redirect(`/admin/login?error=pin&next=${encodeURIComponent(nextPath)}`);
  }

  cookies().set(ADMIN_SESSION_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE
  });

  redirect(nextPath);
}

export async function logoutAdminAction() {
  cookies().set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 0
  });

  redirect("/admin/login");
}

function normalizeAdminPath(value: string) {
  if (!value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }

  return value;
}

