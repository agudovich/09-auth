// lib/api/serverApi.ts
import "server-only";
import { cookies } from "next/headers";

const base = `${process.env.NEXT_PUBLIC_API_URL}/api`;

async function sfetch(input: string, init?: RequestInit) {
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(base + input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      cookie: cookieHeader,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Server API ${res.status}`);
  return res;
}

export async function ssrGetMe() {
  const res = await sfetch("/users/me", { method: "GET" });
  return res.json();
}

export async function ssrGetNoteById(id: string) {
  const res = await sfetch(`/notes/${id}`, { method: "GET" });
  return res.json();
}
