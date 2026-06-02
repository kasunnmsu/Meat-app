"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const locations = ["PUCPR", "UFBA"];

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

  const mode = searchParams.get("mode");
  const nextPage = searchParams.get("next") || "/session-1";
  const isFullSurvey = mode === "survey";

  const [location, setLocation] = useState("PUCPR");
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
      alert("Please enter an existing participant ID.");
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
        alert("Please enter an existing participant ID.");
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

  function getSelectedSessionLabel() {
    if (isFullSurvey) {
      return "Full Survey — Sessions 1, 2, and 3";
    }

    if (nextPage.includes("session-3")) {
      return "3rd Session";
    }

    if (nextPage.includes("session-2")) {
      return "2nd Session";
    }

    return "1st Session";
  }

  return (
    <main className="start-page">
      <section className="start-card">
        <a href="/" className="back-link">← Back to home</a>

        <div className="start-header">
          <div className="badge">
            {isFullSurvey ? "New Survey" : "Participant Setup"}
          </div>

          <h1>{isFullSurvey ? "Start New Survey" : "Participant Start"}</h1>

          <p>
            {isFullSurvey
              ? "Create one unique participant ID. This same ID will be used across all three sessions."
              : "Create a new participant ID, or enter an existing participant ID when continuing a previous participant."}
          </p>
        </div>

        <div className="selected-session">
          <span>Selected flow</span>
          <strong>{getSelectedSessionLabel()}</strong>
        </div>

        <label className="form-group">
          <span>Study location</span>

          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="start-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleGenerateId}
          >
            Create New Participant ID
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleContinue}
          >
            {isFullSurvey ? "Start Session 1" : "Start Session"}
          </button>
        </div>

        {participantId && (
          <div className="participant-id-box">
            <span>Current Participant ID</span>
            <strong>{participantId}</strong>
          </div>
        )}

        <div className="existing-id-box">
          <h2>Use Existing Participant ID</h2>
          <p>
            Use this only when the same participant is continuing a later session.
          </p>

          <input
            type="text"
            value={existingParticipantId}
            onChange={(event) => setExistingParticipantId(event.target.value)}
            placeholder="Paste existing participant ID"
          />

          <button
            type="button"
            className="secondary-button"
            onClick={handleUseExistingId}
          >
            Use Existing ID
          </button>
        </div>
      </section>
    </main>
  );
}

export default function ParticipantStartPage() {
  return (
    <Suspense
      fallback={
        <main className="start-page">
          <section className="start-card">
            <p>Loading participant setup...</p>
          </section>
        </main>
      }
    >
      <ParticipantStartContent />
    </Suspense>
  );
}
