// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isPrivate = (p: string) =>
  p.startsWith("/notes") || p.startsWith("/profile");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Защищаем только приватные роуты
  if (!isPrivate(pathname)) {
    return NextResponse.next();
  }

  // Мягкая проверка сессии через наш API. Без ручных cookie, без кэша.
  // Если что-то не так — считаем, что не залогинен и шлём на /sign-in
  let hasUser = false;
  try {
    const res = await fetch(new URL("/api/auth/session", req.url), {
      cache: "no-store",
      // Доп. заголовок — ломаем любой промежуточный кэш
      headers: { "x-mw": "1" },
    });
    if (res.status === 200) {
      // в нашем API: 200 с JSON = есть пользователь; 200 с пустым телом = гость
      const text = await res.text();
      if (text.trim()) {
        hasUser = true;
      }
    }
  } catch {
    hasUser = false;
  }

  if (!hasUser) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// защищаем только то, что нужно
export const config = {
  matcher: ["/notes/:path*", "/profile/:path*"],
};
