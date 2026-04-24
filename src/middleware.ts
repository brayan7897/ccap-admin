import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // If not authenticated, redirect to /login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Block student role explicitly; allow other roles if API does not report student
  const rawRole = (
    ((req.auth.user as { roleName?: string; role?: string }).roleName ?? "") ||
    ((req.auth.user as { role?: string }).role ?? "")
  ).toString();
  const role = rawRole.trim().toLowerCase();

  // Block only explicit student roles — all other authenticated roles are allowed
  const studentRoles = ["student", "alumno", "estudiante"];
  if (studentRoles.includes(role)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("blocked", "student");
    return NextResponse.redirect(loginUrl);
  }
});

// Protect all routes except login, api and static assets
export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
