import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isPrivate = (p: string) =>
  p.startsWith("/notes") || p.startsWith("/profile");
const isPublic = (p: string) => p === "/sign-in" || p === "/sign-up";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // куки подтянутся автоматически; запрещаем кэш
  const res = await fetch(new URL("/api/auth/session", req.url), {
    cache: "no-store",
    headers: { "x-mw": "1" }, // любой заголовок, лишь бы сломать возможный кеш CDN
  });

  let hasUser = false;
  if (res.status === 200) {
    try {
      const data = await res.json(); // <- не text()
      hasUser = !!(data && (data.email || data.id));
    } catch {
      hasUser = false;
    }
  }

  if (isPrivate(pathname) && !hasUser) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublic(pathname) && hasUser) {
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
