"use client";

import { useEffect, useMemo, useState } from "react";
import RankingScreen, { RankingOption } from "@/components/RankingScreen";
import DemographicsForm, { DemographicsData } from "@/components/DemographicsForm";
import { seededShuffle } from "@/lib/randomization";
import {
  getRankingOptionsForLocation,
  getSealsForLocation,
  LocationSealInfo,
} from "@/lib/locationStudyConfig";

type SealReadingRecord = {
  sealId: string;
  sealName: string;
  openedAt: string;
};

type Step =
  | "reading"
  | "agreement"
  | "ranking"
  | "final-confirmation"
  | "demographics"
  | "completed";

export default function SessionTwoDescriptionsPage() {
  const [participantId, setParticipantId] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [step, setStep] = useState<Step>("reading");
  const [readSealIds, setReadSealIds] = useState<string[]>([]);
  const [sealReadingRecords, setSealReadingRecords] = useState<SealReadingRecord[]>([]);
  const [activeSeal, setActiveSeal] = useState<LocationSealInfo | null>(null);
  const [completedRanking, setCompletedRanking] = useState<RankingOption[]>([]);
  const [agreedToDescriptions, setAgreedToDescriptions] = useState("");

  useEffect(() => {
    setParticipantId(localStorage.getItem("participantId") || "DEMO-PARTICIPANT");
    setParticipantLocation(localStorage.getItem("participantLocation") || "PUCPR");
  }, []);

  const seals = useMemo(() => {
    return getSealsForLocation(participantLocation);
  }, [participantLocation]);

  const baseOptions = useMemo(() => {
    return getRankingOptionsForLocation(participantLocation, 2);
  }, [participantLocation]);

  const randomizationSeed = useMemo(() => {
    return participantId ? `${participantId}-session-2` : "demo-session-2";
  }, [participantId]);

  const randomizedOptions = useMemo(() => {
    return seededShuffle(baseOptions, randomizationSeed);
  }, [baseOptions, randomizationSeed]);

  const allSealsRead = readSealIds.length === seals.length;

  function openSealDescription(seal: LocationSealInfo) {
    setActiveSeal(seal);

    if (!readSealIds.includes(seal.id)) {
      setReadSealIds((current) => [...current, seal.id]);

      setSealReadingRecords((current) => [
        ...current,
        {
          sealId: seal.id,
          sealName: seal.name,
          openedAt: new Date().toISOString(),
        },
      ]);
    }
  }

  function closeSealDescription() {
    setActiveSeal(null);
  }

  function handleAgreementYes() {
    setAgreedToDescriptions("Yes");
    setStep("ranking");
  }

  function handleAgreementNo() {
    setAgreedToDescriptions("No");
    setStep("reading");
  }

  function handleRankingComplete(ranking: RankingOption[]) {
    setCompletedRanking(ranking);
    setStep("final-confirmation");
  }

  async function handleFinalConfirmationYes() {
    const surveyMode = localStorage.getItem("surveyMode");

    if (surveyMode === "full") {
      await saveSessionTwoWithoutQuestionnaire();
      return;
    }

    setStep("demographics");
  }

  function handleFinalConfirmationNo() {
    setCompletedRanking([]);
    setStep("ranking");
  }

  function getSealById(sealId?: string) {
    return seals.find((seal) => seal.id === sealId) || null;
  }

  function buildLongRows(demographics?: DemographicsData) {
    const timestamp = new Date().toISOString();

    return completedRanking.map((option, index) => ({
      participant_id: participantId,
      location: participantLocation,
      session_number: 2,
      method: "Seal descriptions + Choice experiment / Best-Worst Scaling ranking",
      randomization_seed: randomizationSeed,
      agreed_to_descriptions: agreedToDescriptions,
      selected_rank: index + 1,
      option_id: option.id,
      cut_id: option.cutId || "",
      seal_id: option.sealId || "",
      title: option.title,
      subtitle: option.subtitle || "",
      cut_image_url: option.cutImageUrl || "",
      seal_image_url: option.sealImageUrl || "",
      seal_color: option.sealColor || "",
      gender: demographics?.gender || "Collected in Session 3",
      age_group: demographics?.ageGroup || "Collected in Session 3",
      education_level: demographics?.educationLevel || "Collected in Session 3",
      income_group: demographics?.incomeGroup || "Collected in Session 3",
      timestamp,
    }));
  }

  function buildParticipantRow(demographics?: DemographicsData) {
    const timestamp = new Date().toISOString();

    return {
      participant_id: participantId,
      location: participantLocation,
      session_number: 2,
      method: "Seal descriptions + Choice experiment / Best-Worst Scaling ranking",
      randomization_seed: randomizationSeed,
      agreed_to_descriptions: agreedToDescriptions,

      gender: demographics?.gender || "Collected in Session 3",
      age_group: demographics?.ageGroup || "Collected in Session 3",
      education_level: demographics?.educationLevel || "Collected in Session 3",
      income_group: demographics?.incomeGroup || "Collected in Session 3",

      seals_read_count: readSealIds.length,
      all_seals_read: allSealsRead ? "Yes" : "No",

      rank_1_option_id: completedRanking[0]?.id || "",
      rank_1_cut_id: completedRanking[0]?.cutId || "",
      rank_1_seal_id: completedRanking[0]?.sealId || "",
      rank_1_title: completedRanking[0]?.title || "",

      rank_2_option_id: completedRanking[1]?.id || "",
      rank_2_cut_id: completedRanking[1]?.cutId || "",
      rank_2_seal_id: completedRanking[1]?.sealId || "",
      rank_2_title: completedRanking[1]?.title || "",

      rank_3_option_id: completedRanking[2]?.id || "",
      rank_3_cut_id: completedRanking[2]?.cutId || "",
      rank_3_seal_id: completedRanking[2]?.sealId || "",
      rank_3_title: completedRanking[2]?.title || "",

      rank_4_option_id: completedRanking[3]?.id || "",
      rank_4_cut_id: completedRanking[3]?.cutId || "",
      rank_4_seal_id: completedRanking[3]?.sealId || "",
      rank_4_title: completedRanking[3]?.title || "",

      rank_5_option_id: completedRanking[4]?.id || "",
      rank_5_cut_id: completedRanking[4]?.cutId || "",
      rank_5_seal_id: completedRanking[4]?.sealId || "",
      rank_5_title: completedRanking[4]?.title || "",

      timestamp,
    };
  }

  function buildSealReadingRows() {
    const timestamp = new Date().toISOString();

    return sealReadingRecords.map((record) => ({
      participant_id: participantId,
      location: participantLocation,
      session_number: 2,
      seal_id: record.sealId,
      seal_name: record.sealName,
      opened_description: "Yes",
      opened_at: record.openedAt,
      agreed_to_descriptions: agreedToDescriptions,
      timestamp,
    }));
  }

  async function saveSessionTwoBase(demographics?: DemographicsData) {
    const longRows = buildLongRows(demographics);
    const participantRow = buildParticipantRow(demographics);
    const sealReadingRows = buildSealReadingRows();

    const response = await fetch("/api/session-2/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantRow,
        longRows,
        sealReadingRows,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Session 2 save failed:", errorData);
      alert("Could not save Session 2. Please try again.");
      return;
    }

    localStorage.setItem("session-2-ranking", JSON.stringify(longRows));
    localStorage.setItem("session-2-seal-readings", JSON.stringify(sealReadingRows));

    if (demographics) {
      localStorage.setItem("session-2-demographics", JSON.stringify(demographics));
    }

    setStep("completed");
  }

  async function saveSessionTwoWithoutQuestionnaire() {
    await saveSessionTwoBase();
  }

  async function saveSessionTwo(demographics: DemographicsData) {
    await saveSessionTwoBase(demographics);
  }

  return (
    <main className="study-page">
      <section className="study-shell">
        <a href="/" className="back-link">
          ← Back to sessions
        </a>

        <header className="study-header">
          <div className="badge">Session 2</div>
          <h1>Seal Descriptions + Choice Ranking</h1>

          <p>
            Participants must click each seal and read its description before continuing.
            After all descriptions are read, the participant confirms whether they agree
            with the presented information.
          </p>

          <div className="participant-strip">
            <span>Participant ID</span>
            <strong>{participantId || "Loading..."}</strong>
          </div>

          <div className="participant-strip">
            <span>Location</span>
            <strong>{participantLocation || "Loading..."}</strong>
          </div>
        </header>

        {step === "reading" && (
          <section className="session-two-card">
            <div className="session-two-heading">
              <div>
                <h2>Read all seal descriptions</h2>
                <p>
                  Click each seal to read a brief description. A verification mark will
                  appear after the description has been opened.
                </p>
              </div>

              <div className="read-counter">
                {readSealIds.length}/{seals.length} read
              </div>
            </div>

            <div className="seal-description-grid">
              {seals.map((seal) => {
                const wasRead = readSealIds.includes(seal.id);

                return (
                  <button
                    key={seal.id}
                    type="button"
                    className="seal-description-card"
                    onClick={() => openSealDescription(seal)}
                  >
                    <div className="seal-image-holder">
                      <img src={seal.imageUrl} alt={seal.name} />
                    </div>

                    <div>
                      <h3>{seal.name}</h3>
                      <p>Click to read description</p>
                    </div>

                    {wasRead && <div className="read-check">✓</div>}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={allSealsRead ? "purchase-button" : "purchase-button disabled"}
              onClick={() => {
                if (allSealsRead) {
                  setStep("agreement");
                }
              }}
            >
              {allSealsRead ? "Continue" : "Read all seal descriptions to continue"}
            </button>
          </section>
        )}

        {step === "agreement" && (
          <section className="complete-card">
            <div className="badge">Confirmation</div>
            <h2>Do you agree with the descriptions?</h2>
            <p>
              Please confirm whether you agree with the descriptions presented for the
              labels. If you select “No”, you will return to the label-reading screen.
            </p>

            <div className="final-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleAgreementNo}
              >
                No, review descriptions
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleAgreementYes}
              >
                Yes, continue to ranking
              </button>
            </div>
          </section>
        )}

        {step === "ranking" && (
          <section className="session-two-ranking-note">
            <div className="description-reminder">
              <strong>Reminder:</strong> During this ranking task, the participant may
              click a seal image to view its description again.
            </div>

            <RankingScreen
              options={randomizedOptions}
              sessionNumber={2}
              onRankingComplete={handleRankingComplete}
              onSealClick={(sealId) => {
                const seal = getSealById(sealId);
                if (seal) openSealDescription(seal);
              }}
            />
          </section>
        )}

        {step === "final-confirmation" && (
          <section className="complete-card">
            <div className="badge">Final confirmation</div>
            <h2>Confirm your Session 2 ranking</h2>
            <p>
              Please review the final order of preference. Do you confirm these choices?
            </p>

            <ol className="final-ranking-list">
              {completedRanking.map((option, index) => (
                <li key={option.id}>
                  <strong>#{index + 1}</strong>
                  <span>{option.title}</span>
                  <small>
                    Cut: {option.cutId} | Seal: {option.sealId}
                  </small>
                </li>
              ))}
            </ol>

            <div className="final-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleFinalConfirmationNo}
              >
                No, redo ranking
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleFinalConfirmationYes}
              >
                Yes, save and continue
              </button>
            </div>
          </section>
        )}

        {step === "demographics" && (
          <section className="complete-card">
            <DemographicsForm onSubmit={saveSessionTwo} />
          </section>
        )}

        {step === "completed" && (
          <section className="complete-card">
            <div className="badge">Completed</div>
            <h2>Session 2 Complete</h2>
            <p>The seal-reading step and ranking task have been saved.</p>

            <div className="final-actions">
              <a href="/" className="secondary-link-button">
                Return to Home
              </a>

              <a href="/session-3" className="primary-link-button">
                Continue to Session 3
              </a>
            </div>
          </section>
        )}
      </section>

      {activeSeal && (
        <div className="modal-backdrop">
          <section className="modal-card seal-modal-card">
            <img src={activeSeal.imageUrl} alt={activeSeal.name} />

            <h2>{activeSeal.name}</h2>
            <p>{activeSeal.description}</p>

            <button
              type="button"
              className="primary-button"
              onClick={closeSealDescription}
            >
              I have read this description
            </button>
          </section>
        </div>
      )}
    </main>
  );
}