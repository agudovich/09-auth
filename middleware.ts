import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isPrivatePath = (p: string) =>
  p.startsWith("/notes") || p.startsWith("/profile");
const isPublicPath = (p: string) => p === "/sign-in" || p === "/sign-up";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const sessionRes = await fetch(`${origin}/api/auth/session`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
    credentials: "include",
  });

  const body = await sessionRes.text();
  const hasUser = sessionRes.ok && body.trim().length > 0;

  if (isPrivatePath(pathname) && !hasUser) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicPath(pathname) && hasUser) {
    const url = req.nextUrl.clone();
    url.pathname = "/profile";
    url.searchParams.delete("from");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
