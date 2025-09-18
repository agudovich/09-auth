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
const isBrowser = typeof window !== "undefined";

// В БРАУЗЕРЕ всегда используем текущий origin (чтобы куки точно отправлялись)
const chosenBase =
  (isBrowser ? window.location.origin : undefined) ??
  envUrl ??
  "http://localhost:3000";

export const client = axios.create({
  baseURL: `${chosenBase}/api`,
  withCredentials: true,
});
