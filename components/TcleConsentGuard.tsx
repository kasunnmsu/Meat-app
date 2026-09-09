"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  hasMatchingTcleConsent,
  locationRequiresTcle,
  parseTcleConsent,
  TCLE_CONSENT_STORAGE_KEY,
} from "@/lib/tcleConsent";

const PROTECTED_PATHS = ["/session-1", "/session-2", "/session-3"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export default function TcleConsentGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verifiedPath, setVerifiedPath] = useState<string | null>(null);
  const protectedPath = isProtectedPath(pathname);

  useEffect(() => {
    if (!protectedPath) return;

    const participantId = localStorage.getItem("participantId") || "";
    const location = localStorage.getItem("participantLocation") || "";

    if (!locationRequiresTcle(location)) {
      setVerifiedPath(pathname);
      return;
    }

    const consent = parseTcleConsent(
      localStorage.getItem(TCLE_CONSENT_STORAGE_KEY)
    );

    if (!hasMatchingTcleConsent(consent, participantId, location)) {
      router.replace("/tcle");
      return;
    }

    setVerifiedPath(pathname);
  }, [pathname, protectedPath, router]);

  if (protectedPath && verifiedPath !== pathname) {
    return (
      <main className="study-page tcle-loading-page" aria-busy="true">
        <p>Carregando...</p>
      </main>
    );
  }

  return children;
}
