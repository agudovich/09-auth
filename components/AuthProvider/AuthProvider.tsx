"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession /*, signOut*/ } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

const PRIVATE_PREFIXES = ["/notes", "/profile"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, clearAuth, isAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const user = await getSession();
        if (ignore) return;
        if (user) setUser(user);
        else clearAuth();
      } finally {
        if (!ignore) setChecking(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [setUser, clearAuth]);

  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (checking) return;

    if (isPrivate && !isAuthenticated) {
      const to = "/sign-in";
      router.replace(to);
    }
  }, [checking, isPrivate, isAuthenticated, router]);

  if (checking) return null;

  return <>{children}</>;
}
