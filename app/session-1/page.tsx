"use client";

import { useEffect, useMemo, useState } from "react";
import RankingScreen, { RankingOption } from "@/components/RankingScreen";
import DemographicsForm, { DemographicsData } from "@/components/DemographicsForm";
import { seededShuffle } from "@/lib/randomization";
import { getRankingOptionsForLocation } from "@/lib/locationStudyConfig";

type Step = "ranking" | "final-confirmation" | "demographics" | "completed";

export default function SessionOnePage() {
  const [participantId, setParticipantId] = useState("");
  const [participantLocation, setParticipantLocation] = useState<string | null>(null);
  const [completedRanking, setCompletedRanking] = useState<RankingOption[]>([]);
  const [step, setStep] = useState<Step>("ranking");

  useEffect(() => {
    const storedParticipantId =
      localStorage.getItem("participantId") || "DEMO-PARTICIPANT";

    const storedLocation =
      localStorage.getItem("participantLocation") || "PUCPR";

    setParticipantId(storedParticipantId);
    setParticipantLocation(storedLocation);
  }, []);

  const randomizationSeed = useMemo(() => {
    return participantId ? `${participantId}-session-1` : "demo-session-1";
  }, [participantId]);

  const locationOptions = useMemo(() => {
    if (!participantLocation) return [];

    return getRankingOptionsForLocation(participantLocation, 1);
  }, [participantLocation]);

  const randomizedOptions = useMemo(() => {
    return seededShuffle(locationOptions, randomizationSeed);
  }, [locationOptions, randomizationSeed]);

  function handleRankingComplete(ranking: RankingOption[]) {
    setCompletedRanking(ranking);
    setStep("final-confirmation");
  }

  async function handleFinalConfirmationYes() {
    const surveyMode = localStorage.getItem("surveyMode");

    if (surveyMode === "full") {
      await saveSessionOneWithoutQuestionnaire();
      return;
    }

    setStep("demographics");
  }

  function handleFinalConfirmationNo() {
    setCompletedRanking([]);
    setStep("ranking");
  }

  function buildLongRows(demographics?: DemographicsData) {
    const timestamp = new Date().toISOString();

    return completedRanking.map((option, index) => ({
      participant_id: participantId,
      location: participantLocation || "",
      session_number: 1,
      method: "Choice experiment / Best-Worst Scaling ranking",
      randomization_seed: randomizationSeed,
      selected_rank: index + 1,
      option_id: option.id,
      cut_id: option.cutId || "",
      seal_id: option.sealId || "",
      title: option.title,
      subtitle: option.subtitle || "",
      cut_image_url: option.cutImageUrl || "",
      seal_image_url: option.sealImageUrl || "",
      seal_color: option.sealColor || "",
      screen_started_at: option.screenStartedAt || "",
      option_selected_at: option.optionSelectedAt || "",
      purchase_confirmed_at: option.purchaseConfirmedAt || "",
      time_spent_before_choice_ms: option.timeSpentBeforeChoiceMs || "",
      time_spent_before_choice_seconds: option.timeSpentBeforeChoiceSeconds || "",
      time_taken_to_confirm_ms: option.timeTakenToConfirmMs || "",
      time_taken_to_confirm_seconds: option.timeTakenToConfirmSeconds || "",
      changed_preference_before_confirming:
        option.changedPreferenceBeforeConfirming || "",
      initial_selected_option_id: option.initialSelectedOptionId || "",
      final_confirmed_option_id: option.finalConfirmedOptionId || "",
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
      location: participantLocation || "",
      session_number: 1,
      method: "Choice experiment / Best-Worst Scaling ranking",
      randomization_seed: randomizationSeed,

      gender: demographics?.gender || "Collected in Session 3",
      age_group: demographics?.ageGroup || "Collected in Session 3",
      education_level: demographics?.educationLevel || "Collected in Session 3",
      income_group: demographics?.incomeGroup || "Collected in Session 3",

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

  async function saveSessionOne(demographics?: DemographicsData) {
    const longRows = buildLongRows(demographics);
    const participantRow = buildParticipantRow(demographics);

    const response = await fetch("/api/session-1/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantRow,
        longRows,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Session 1 save failed:", errorData);
      alert("Could not save Session 1. Please try again.");
      return;
    }

    localStorage.setItem("session-1-ranking", JSON.stringify(longRows));

    if (demographics) {
      localStorage.setItem("session-1-demographics", JSON.stringify(demographics));
    }

    setStep("completed");
  }

  async function saveSessionOneWithoutQuestionnaire() {
    await saveSessionOne();
  }

  async function exportExcel(demographics: DemographicsData) {
    await saveSessionOne(demographics);
  }

  return (
    <main className="study-page">
      <section className="study-shell">
        <a href="/" className="back-link">
          ← Back to sessions
        </a>

        <header className="study-header">
          <div className="badge">Session 1</div>
          <h1>Choice Experiment / BWS Ranking</h1>

          <p>
            Five beef cut and seal options are presented at once. The participant chooses
            the option they would buy first, confirms the choice, and the selected option
            disappears. This continues until all options are ranked.
          </p>

          <div className="participant-strip">
            <span>Participant ID</span>
            <strong>{participantId || "Loading..."}</strong>
          </div>

          <div className="participant-strip">
            <span>Location</span>
            <strong>{participantLocation || "Loading..."}</strong>
          </div>

          <div className="participant-strip">
            <span>Randomization seed</span>
            <strong>{randomizationSeed}</strong>
          </div>
        </header>

        {step === "ranking" && !participantLocation && (
          <section className="complete-card">
            <p>Loading location-specific options...</p>
          </section>
        )}

        {step === "ranking" && participantLocation && (
          <RankingScreen
            key={`${participantLocation}-${randomizationSeed}`}
            options={randomizedOptions}
            sessionNumber={1}
            onRankingComplete={handleRankingComplete}
          />
        )}

        {step === "final-confirmation" && (
          <section className="complete-card">
            <div className="badge">Final confirmation</div>
            <h2>Confirm your ranking</h2>
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
            <DemographicsForm onSubmit={exportExcel} />
          </section>
        )}

        {step === "completed" && (
          <section className="complete-card">
            <div className="badge">Completed</div>
            <h2>Session 1 Complete</h2>
            <p>The Session 1 ranking has been saved.</p>

            <div className="final-actions">
              <a href="/" className="secondary-link-button">
                Return to Home
              </a>

              <a href="/session-2/descriptions" className="primary-link-button">
                Continue to Session 2
              </a>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}