// lib/api/api.ts
import axios from "axios";

function normalizeBaseUrl(v?: string | null) {
  if (!v) return undefined;
  let url = v.trim();
  if (url.endsWith("/")) url = url.slice(0, -1);
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

const envUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
const runtimeUrl =
  typeof window !== "undefined" ? window.location.origin : undefined;

const baseURL = `${envUrl ?? runtimeUrl ?? "http://localhost:3000"}/api`;

export const client = axios.create({
  baseURL,
  withCredentials: true,
});
