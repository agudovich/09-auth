// lib/api/clientApi.ts
import { client } from "./api";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";

// ---- AUTH ----
export async function signUp(data: {
  email: string;
  password: string;
}): Promise<User> {
  const res = await client.post<User>("/auth/register", data);
  return res.data;
}

export async function signIn(data: {
  email: string;
  password: string;
}): Promise<User> {
  const res = await client.post<User>("/auth/login", data);
  return res.data;
}

export async function signOut(): Promise<void> {
  await client.post("/auth/logout");
}

export async function getSession(): Promise<User | null> {
  const res = await client.get<User | "" | null>("/auth/session");
  return (res.data as User) ?? null;
}

// ---- USERS ----
export async function getMe(): Promise<User> {
  const res = await client.get<User>("/users/me");
  return res.data;
}

export async function updateMe(payload: Partial<User>): Promise<User> {
  const res = await client.patch<User>("/users/me", payload);
  return res.data;
}

// ---- NOTES ----
export type FetchNotesResponse = { notes: Note[]; totalPages: number };

export async function getNotes(params: {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
}): Promise<{ notes: Note[]; totalPages: number }> {
  const res = await client.get("/notes", { params });
  return res.data;
}

export async function getNoteById(id: string): Promise<Note> {
  const res = await client.get(`/notes/${id}`);
  return res.data;
}

export async function createNote(payload: {
  title: string;
  content: string;
  tag: string;
}): Promise<Note> {
  const res = await client.post("/notes", payload);
  return res.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const res = await client.delete(`/notes/${id}`);
  return res.data;
}
