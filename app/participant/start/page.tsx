"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const locations = ["PUCPR", "UFBA", "NMSU"];

const locationColors: Record<string, string> = {
  PUCPR: "#bb0b0b",
  UFBA: "#1a7a3a",
  NMSU: "#bb0b0b",
};

function createParticipantId(location: string) {
  const prefix = location.replace(/\s+/g, "").toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${Date.now()}-${random}`;
}

function clearPreviousParticipantData() {
  localStorage.removeItem("participantId");
  localStorage.removeItem("participantLocation");
  localStorage.removeItem("surveyMode");
  localStorage.removeItem("surveyStartedAt");
  localStorage.removeItem("selectedSessionPath");

  localStorage.removeItem("session-1-ranking");
  localStorage.removeItem("session-1-demographics");

  localStorage.removeItem("session-2-ranking");
  localStorage.removeItem("session-2-demographics");
  localStorage.removeItem("session-2-seal-readings");

  localStorage.removeItem("session-3-ranking");
  localStorage.removeItem("session-3-demographics");
}

function ParticipantStartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const mode = searchParams.get("mode");
  const nextPage = searchParams.get("next") || "/session-1";
  const isFullSurvey = mode === "survey";

  const [location, setLocation] = useState("PUCPR");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [participantId, setParticipantId] = useState("");
  const [existingParticipantId, setExistingParticipantId] = useState("");
  const [useExistingId, setUseExistingId] = useState(false);

  function getDestination() {
    return isFullSurvey ? "/session-1" : nextPage;
  }

  function saveParticipant(id: string) {
    localStorage.setItem("participantId", id);
    localStorage.setItem("participantLocation", location);
    localStorage.setItem("surveyMode", isFullSurvey ? "full" : "single");
    localStorage.setItem("surveyStartedAt", new Date().toISOString());
    localStorage.setItem("selectedSessionPath", getDestination());
  }

  function handleGenerateId() {
    clearPreviousParticipantData();

    const id = createParticipantId(location);

    setUseExistingId(false);
    setExistingParticipantId("");
    setParticipantId(id);

    saveParticipant(id);
  }

  function handleUseExistingId() {
    const cleanId = existingParticipantId.trim();

    if (!cleanId) {
      alert(t("start.alertNoId"));
      return;
    }

    clearPreviousParticipantData();

    setUseExistingId(true);
    setParticipantId(cleanId);

    saveParticipant(cleanId);
  }

  function handleContinue() {
    let id = participantId;

    if (useExistingId) {
      id = existingParticipantId.trim();

      if (!id) {
        alert(t("start.alertNoId"));
        return;
      }

      saveParticipant(id);
      router.push(getDestination());
      return;
    }

    if (!id) {
      clearPreviousParticipantData();

      id = createParticipantId(location);

      setParticipantId(id);
      saveParticipant(id);
    }

    router.push(getDestination());
  }


  return (
    <main className="home-page">
      <a href="/" className="back-btn-red" style={{ background: locationColors[location] ?? "#bb0b0b" }}>{t("start.back")}</a>
      <div className="home-illustration">
        <div className="home-card start-card-wide">
          <label className="form-group">
            <span>{t("start.location")}</span>
            <div
              ref={dropdownRef}
              className="custom-select"
              style={{ borderColor: locationColors[location] ?? "#bb0b0b" }}
            >
              <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <span style={{ color: locationColors[location] ?? "#bb0b0b", fontWeight: 700 }}>{location}</span>
                <span className="custom-select-arrow" style={{ color: locationColors[location] ?? "#bb0b0b" }}>▾</span>
              </button>

              {dropdownOpen && (
                <ul className="custom-select-menu">
                  {locations.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className={`custom-select-option${item === location ? " custom-select-option--active" : ""}`}
                        style={item === location ? { background: locationColors[item], color: "#fff" } : undefined}
                        onMouseEnter={(e) => {
                          if (item !== location) (e.currentTarget as HTMLButtonElement).style.background = locationColors[item] + "22";
                        }}
                        onMouseLeave={(e) => {
                          if (item !== location) (e.currentTarget as HTMLButtonElement).style.background = "";
                        }}
                        onClick={() => { setLocation(item); setDropdownOpen(false); }}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>

          <div className="start-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleGenerateId}
            >
              {t("start.createId")}
            </button>

            <button
              type="button"
              className="home-primary-btn"
              style={{ background: locationColors[location] ?? "#bb0b0b" }}
              onClick={handleContinue}
            >
              {t("start.continue")}
            </button>
          </div>

          {participantId && (
            <div className="participant-id-box">
              <span>{t("start.currentId")}</span>
              <strong>{participantId}</strong>
            </div>
          )}

          <div className="existing-id-box">
            <h2>{t("start.existingTitle")}</h2>
            <p>
              {t("start.existingDesc")}
            </p>
            <input
              type="text"
              value={existingParticipantId}
              onChange={(event) => setExistingParticipantId(event.target.value)}
              placeholder={t("start.idPlaceholder")}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={handleUseExistingId}
            >
              {t("start.useId")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ParticipantStartPage() {
  return (
    <Suspense
      fallback={
        <main className="home-page">
          <div className="home-illustration">
            <p>Carregando...</p>
          </div>
        </main>
      }
    >
      <ParticipantStartContent />
    </Suspense>
  );
}
