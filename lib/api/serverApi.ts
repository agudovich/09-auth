// lib/api/serverApi.ts
import { cookies } from "next/headers";
import { client } from "./api";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";

type CookiePair = { name: string; value: string };
type CookieStoreLike = { getAll(): CookiePair[] };
type SessionPayload = { user: User | null };

function isPromise<T>(v: unknown): v is Promise<T> {
  return (
    typeof v === "object" &&
    v !== null &&
    "then" in (v as Record<string, unknown>)
  );
}

async function readCookiePairs(): Promise<CookiePair[]> {
  const maybeStore = cookies() as unknown;
  if (isPromise<CookieStoreLike>(maybeStore)) {
    const store = await maybeStore;
    return typeof store?.getAll === "function" ? store.getAll() : [];
  }
  const store = maybeStore as CookieStoreLike | undefined;
  return store && typeof store.getAll === "function" ? store.getAll() : [];
}

async function cookieHeader(): Promise<string> {
  const list = await readCookiePairs();
  return list.map(({ name, value }) => `${name}=${value}`).join("; ");
}

// ---- SSR API ----
export async function ssrGetSession(): Promise<SessionPayload> {
  const { data } = await client.get<SessionPayload>("/auth/session", {
    headers: { Cookie: await cookieHeader() },
    withCredentials: true,
  });
  return data;
}

export async function ssrGetMe(): Promise<User> {
  const { data } = await client.get<User>("/users/me", {
    headers: { Cookie: await cookieHeader() },
    withCredentials: true,
  });
  return data;
}

export async function ssrGetNoteById(id: string): Promise<Note> {
  const { data } = await client.get<Note>(`/notes/${id}`, {
    headers: { Cookie: await cookieHeader() },
    withCredentials: true,
  });
  return data;
}
