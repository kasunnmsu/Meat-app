export const TCLE_CONSENT_STORAGE_KEY = "tcleConsent";

export type TcleConsent = {
  participantId: string;
  location: string;
  acceptedAt: string;
};

export function locationRequiresTcle(location: string) {
  return location === "PUCPR" || location === "UFBA" || location === "NMSU";
}

export function parseTcleConsent(rawConsent: string | null): TcleConsent | null {
  if (!rawConsent) return null;

  try {
    const consent = JSON.parse(rawConsent) as Partial<TcleConsent>;

    if (
      typeof consent.participantId !== "string" ||
      typeof consent.location !== "string" ||
      typeof consent.acceptedAt !== "string" ||
      !consent.participantId ||
      !consent.location ||
      !consent.acceptedAt
    ) {
      return null;
    }

    return consent as TcleConsent;
  } catch {
    return null;
  }
}

export function hasMatchingTcleConsent(
  consent: TcleConsent | null,
  participantId: string,
  location: string
) {
  return (
    consent?.participantId === participantId && consent.location === location
  );
}
