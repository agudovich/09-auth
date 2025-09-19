// middleware.ts
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const PRIVATE_PREFIXES = ["/notes", "/profile"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isPrivate = PRIVATE_PREFIXES.some((r) => pathname.startsWith(r));

  // --- helper: попытка рефреша токенов по refreshToken ---
  async function tryRefresh(): Promise<string[]> {
    if (!refreshToken) return [];
    try {
      const r = await fetch(new URL("/api/auth/refresh", req.url), {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") ?? "" },
      });
      if (!r.ok) return [];

      const setCookies: string[] = [];
      if (typeof r.headers.getSetCookie === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return r.headers.getSetCookie() as string[];
      }
      const single = r.headers.get("set-cookie");
      if (single) setCookies.push(single);
      return setCookies;
    } catch {
      return [];
    }
  }

  // Если нет access, но есть refresh — пробуем обновить
  let setCookieFromRefresh: string[] = [];
  if (!accessToken && refreshToken) {
    setCookieFromRefresh = await tryRefresh();
  }

  const gotAccess =
    !!accessToken ||
    setCookieFromRefresh.some((c) => c.startsWith("accessToken="));

  // Авторизован → не пускаем на public (перенаправляем на профиль)
  if (isPublic && gotAccess) {
    const res = NextResponse.redirect(new URL("/profile", req.url));
    setCookieFromRefresh.forEach((c) => res.headers.append("Set-Cookie", c));
    return res;
  }

  // Не авторизован → не пускаем на private (на /sign-in)
  if (isPrivate && !gotAccess) {
    const res = NextResponse.redirect(new URL("/sign-in", req.url));
    // подчистим потенциально протухшие куки
    res.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
    res.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
    return res;
  }

  // Иначе пропускаем дальше; если рефрешился — прокинем Set-Cookie
  const res = NextResponse.next();
  setCookieFromRefresh.forEach((c) => res.headers.append("Set-Cookie", c));
  return res;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
