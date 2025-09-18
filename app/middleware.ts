// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PRIVATE = [/^\/notes/, /^\/profile/];
const PUBLIC = [/^\/sign-in/, /^\/sign-up/];

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const isPrivate = PRIVATE.some((r) => r.test(pathname));
  const isPublic = PUBLIC.some((r) => r.test(pathname));

  const sessionRes = await fetch(new URL("/api/auth/session", origin), {
    headers: { cookie: req.headers.get("cookie") || "" },
    credentials: "include",
  });

  const body = await sessionRes.text(); // пусто => неавторизован
  const hasUser = sessionRes.ok && body.trim().length > 0;

  if (isPrivate && !hasUser) {
    const redirect = new URL("/sign-in", origin);
    redirect.searchParams.set("from", pathname);
    return NextResponse.redirect(redirect);
  }

  if (isPublic && hasUser) {
    return NextResponse.redirect(new URL("/profile", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
