"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RankingScreen, {
  ClickLogRow,
  RankingOption,
  RankingProgressDraft,
} from "@/components/RankingScreen";
import StepTransition from "@/components/StepTransition";
import DemographicsForm, { DemographicsData } from "@/components/DemographicsForm";
import FinalRankingList from "@/components/FinalRankingList";
import { seededShuffle } from "@/lib/randomization";
import { getLocationColor, getSession1Options } from "@/lib/locations";
import { saveWithRetry } from "@/lib/saveWithRetry";
import { useLanguage } from "@/lib/i18n";
import { isCompleteRanking } from "@/lib/payloadValidation";
import { getSealNameKey } from "@/lib/seals";
import { loadSurveyDraft, saveSurveyDraft } from "@/lib/surveyDraft";
import {
  createSessionClickRows,
  createSessionOnePayload,
} from "@/lib/sessionPayloads";
import type {
  FinalConfirmationAttemptRecord,
  RankingSnapshotItem,
  RankingTrackingData,
} from "@/lib/sessionTracking";
type Step = "ranking" | "final-confirmation" | "demographics" | "completed";

type SessionOneDraft = {
  step: Step;
  completedRanking: RankingOption[];
  rankingClickLogs: ClickLogRow[];
  rankingTracking: RankingTrackingData | null;
  rankingProgress: RankingProgressDraft | null;
  demographics: DemographicsData;
  finalConfirmationStartedAt: string | null;
};

const EMPTY_DEMOGRAPHICS: DemographicsData = {
  gender: "",
  ageGroup: "",
  educationLevel: "",
  incomeGroup: "",
};

export default function SessionOnePage() {
  const { t } = useLanguage();
  const [participantId, setParticipantId] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [completedRanking, setCompletedRanking] = useState<RankingOption[]>([]);
  const [rankingClickLogs, setRankingClickLogs] = useState<ClickLogRow[]>([]);
  const [rankingTracking, setRankingTracking] =
    useState<RankingTrackingData | null>(null);
  const [step, setStep] = useState<Step>("ranking");
  const [rankingProgress, setRankingProgress] =
    useState<RankingProgressDraft | null>(null);
  const [demographicsDraft, setDemographicsDraft] =
    useState<DemographicsData>(EMPTY_DEMOGRAPHICS);
  const [draftReady, setDraftReady] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const savingFinalRef = useRef(false);
  const finalConfirmationStartedAtRef = useRef<Date | null>(null);

  useEffect(() => {
    const storedParticipantId =
      localStorage.getItem("participantId") || "DEMO-PARTICIPANT";
    const storedLocation =
      localStorage.getItem("participantLocation") || "UNKNOWN";
    const draft = loadSurveyDraft<SessionOneDraft>(
      "session-1",
      storedParticipantId,
      storedLocation
    );

    setParticipantId(storedParticipantId);
    setParticipantLocation(storedLocation);

    if (draft) {
      setStep(draft.step);
      setCompletedRanking(draft.completedRanking ?? []);
      setRankingClickLogs(draft.rankingClickLogs ?? []);
      setRankingTracking(draft.rankingTracking ?? null);
      setRankingProgress(draft.rankingProgress ?? null);
      setDemographicsDraft(draft.demographics ?? EMPTY_DEMOGRAPHICS);
      finalConfirmationStartedAtRef.current = draft.finalConfirmationStartedAt
        ? new Date(draft.finalConfirmationStartedAt)
        : null;
    }

    if (
      localStorage.getItem("surveyMode") === "full" &&
      !localStorage.getItem("surveyStartedAt")
    ) {
      localStorage.setItem("surveyStartedAt", new Date().toISOString());
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (step === "final-confirmation") {
      finalConfirmationStartedAtRef.current ??= new Date();
    }
  }, [step]);

  useEffect(() => {
    if (!draftReady || !participantId) return;

    saveSurveyDraft<SessionOneDraft>(
      "session-1",
      participantId,
      participantLocation,
      {
        step,
        completedRanking,
        rankingClickLogs,
        rankingTracking,
        rankingProgress,
        demographics: demographicsDraft,
        finalConfirmationStartedAt:
          finalConfirmationStartedAtRef.current?.toISOString() ?? null,
      }
    );
  }, [
    completedRanking,
    demographicsDraft,
    draftReady,
    participantId,
    participantLocation,
    rankingClickLogs,
    rankingProgress,
    rankingTracking,
    step,
  ]);

  const randomizationSeed = useMemo(() => {
    return participantId ? `${participantId}-session-1` : "demo-session-1";
  }, [participantId]);

  const randomizedOptions = useMemo(() => {
    const baseOptions = getSession1Options(participantLocation);
    return seededShuffle(baseOptions, randomizationSeed);
  }, [randomizationSeed, participantLocation]);


  const translatedOptions = useMemo(() => {
    const translatedCutTitle =
      participantLocation === "NMSU"
        ? t("s3.cutTitleNmsu")
        : t("s3.cutTitle");

    return randomizedOptions.map((option) => ({
      ...option,
      title: translatedCutTitle,
      subtitle: t(getSealNameKey(option.sealId)),
    }));
  }, [
    randomizedOptions,
    participantLocation,
    t,
  ]);

  

  function handleRankingComplete(
    ranking: RankingOption[],
    clickLogs: ClickLogRow[] = [],
    tracking?: RankingTrackingData
  ) {
    setCompletedRanking(ranking);
    setRankingClickLogs(clickLogs);
    if (tracking) {
      setRankingTracking(tracking);
    }
    setRankingProgress(null);
    setStep("final-confirmation");
  }

  function createRankingSnapshot(
    ranking: RankingOption[]
  ): RankingSnapshotItem[] {
    return ranking.map((option) => ({
      optionId: option.id,
      sealId: option.sealId || "",
      choiceName: option.subtitle || option.title,
    }));
  }

  function recordFinalConfirmation(
    response: FinalConfirmationAttemptRecord["response"]
  ) {
    if (!rankingTracking) return null;

    const respondedAt = new Date();
    const startedAt = finalConfirmationStartedAtRef.current ?? respondedAt;
    const attempt: FinalConfirmationAttemptRecord = {
      ranking: createRankingSnapshot(completedRanking),
      startedAt: startedAt.toISOString(),
      respondedAt: respondedAt.toISOString(),
      durationMs: Math.max(0, respondedAt.getTime() - startedAt.getTime()),
      response,
    };
    const updatedTracking: RankingTrackingData = {
      ...rankingTracking,
      finalConfirmationAttempts: [
        ...(rankingTracking.finalConfirmationAttempts ?? []),
        attempt,
      ],
    };

    setRankingTracking(updatedTracking);
    return updatedTracking;
  }

  async function handleFinalConfirmationYes() {
    if (savingFinalRef.current) return;

    if (!isCompleteRanking(completedRanking, 5)) {
      alert(t("common.validationError"));
      setStep("ranking");
      return;
    }

    const completedTracking = recordFinalConfirmation("Yes");

    const surveyMode = localStorage.getItem("surveyMode");

    if (surveyMode === "full") {
      savingFinalRef.current = true;
      setIsSavingFinal(true);

      try {
        await saveSessionOneWithoutQuestionnaire(
          completedTracking ?? undefined
        );
      } finally {
        savingFinalRef.current = false;
        setIsSavingFinal(false);
      }
      return;
    }

    setStep("demographics");
  }

  function handleFinalConfirmationNo() {
    recordFinalConfirmation("No");
    finalConfirmationStartedAtRef.current = null;
    setStep("ranking");
  }

  async function saveSessionOne(
    demographics: DemographicsData,
    options: {
      includeLongRowTimingFields: boolean;
      saveDemographicsLocally: boolean;
    },
    trackingOverride?: RankingTrackingData
  ) {
    const timestamp = new Date().toISOString();
    const activeTracking = trackingOverride ?? rankingTracking;
    const collectionStartedAt =
      localStorage.getItem("surveyStartedAt") ||
      activeTracking?.rankingStartedAt ||
      timestamp;
    const rankingSealClicks = rankingClickLogs.reduce<Record<string, number>>(
      (counts, row) => {
        if (row.event_type === "seal_image_click" && row.seal_id) {
          counts[row.seal_id] = (counts[row.seal_id] ?? 0) + 1;
        }
        return counts;
      },
      {}
    );
    const {
      participantRow,
      longRows,
      decisionAttemptRows,
      sealInteractionRows,
      preselectionReorderRows,
      finalConfirmationRows,
      rankingRevisionRows,
      revisionReorderRows,
    } = createSessionOnePayload({
      participantId,
      participantLocation,
      randomizationSeed,
      ranking: completedRanking,
      initialDisplayOrder: translatedOptions,
      demographics,
      timestamp,
      includeLongRowTimingFields: options.includeLongRowTimingFields,
      rankingSealClicks,
      tracking: activeTracking
        ? {
            ...activeTracking,
            collectionStartedAt,
            sessionCompletedAt: timestamp,
          }
        : undefined,
    });
    const clickRows = createSessionClickRows(
      rankingClickLogs,
      participantId,
      participantLocation,
      1,
      timestamp
    );

    const result = await saveWithRetry("/api/session-1/save", {
      participantRow,
      longRows,
      decisionAttemptRows,
      sealInteractionRows,
      preselectionReorderRows,
      finalConfirmationRows,
      rankingRevisionRows,
      revisionReorderRows,
    });

    if (result.validationError) {
      alert(t("common.validationError"));
      setStep("ranking");
      return;
    }

    if (clickRows.length > 0) {
      await saveWithRetry("/api/click-logs/save", { clickRows });
    }

    localStorage.setItem("session-1-ranking", JSON.stringify(longRows));

    if (options.saveDemographicsLocally) {
      localStorage.setItem(
        "session-1-demographics",
        JSON.stringify(demographics)
      );
    }

    if (result.queued) {
      alert(t("common.saveAlert"));
    }

    setStep("completed");
  }

  async function saveSessionOneWithoutQuestionnaire(
    trackingOverride?: RankingTrackingData
  ) {
    await saveSessionOne(
      {
        gender: "Collected in Session 3",
        ageGroup: "Collected in Session 3",
        educationLevel: "Collected in Session 3",
        incomeGroup: "Collected in Session 3",
      },
      {
        includeLongRowTimingFields: true,
        saveDemographicsLocally: false,
      },
      trackingOverride
    );
  }

  async function exportExcel(demographics: DemographicsData) {
    await saveSessionOne(demographics, {
      includeLongRowTimingFields: false,
      saveDemographicsLocally: true,
    });
  }

  return (
    <main className={`study-page location-${participantLocation.toLowerCase()}`}>


      <section className="study-shell">
        <StepTransition stepKey={step}>

        {step === "ranking" && (
          <RankingScreen
            key={`${participantLocation}-${randomizationSeed}`}
            options={translatedOptions}
            sessionNumber={1}
            showSessionLabel={false}
            title={t("s1.rankingTitle")}
            description={t("s1.rankingDesc")}
            location={participantLocation}
            participantId={participantId}
            sealZoom={true}
            initialRanking={completedRanking}
            initialClickLogs={rankingClickLogs}
            initialTracking={rankingTracking ?? undefined}
            initialProgress={rankingProgress ?? undefined}
            onProgressChange={setRankingProgress}
            onRankingComplete={handleRankingComplete}
          />
        )}

        {step === "final-confirmation" && (
          <section className="complete-card final-confirmation-card">
            {participantLocation === "NMSU" && (
               <div className="badge" style={{ background: getLocationColor(participantLocation) }}>{t("s1.badge")}</div>
            )}
            <h2>{t("s1.confirmTitle")}</h2>
            <p>
              {t("s1.confirmDesc")}
            </p>

            <FinalRankingList
              ranking={completedRanking}
              locationColor={getLocationColor(participantLocation)}
            />

            <div className="final-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleFinalConfirmationNo}
              >
                {t("s1.no")}
              </button>

              <button
                type="button"
                className="primary-button"
                 style={{ background: getLocationColor(participantLocation) }}
                onClick={handleFinalConfirmationYes}
                disabled={isSavingFinal}
              >
                {isSavingFinal ? t("s1.saving") : t("s1.yes")}
              </button>
            </div>
          </section>
        )}

        {step === "demographics" && (
          <section className="complete-card demographics-card">
             <DemographicsForm
               onSubmit={exportExcel}
               locationColor={getLocationColor(participantLocation)}
               initialData={demographicsDraft}
               onProgressChange={setDemographicsDraft}
             />
          </section>
        )}

        {step === "completed" && (
          <section className="complete-card completed-step-card">
            {participantLocation === "NMSU" && (
               <div className="badge" style={{ background: getLocationColor(participantLocation) }}>{t("common.completed")}</div>
            )}
            <h2>{t("s1.completedTitle")}</h2>
            <p>{t("common.clickContinue1")} <strong>{t("common.continue")}</strong> {t("common.clickContinue2")}</p>

            <div className="final-actions" style={{ gridTemplateColumns: "1fr" }}>
               <a href="/session-2/descriptions" className="primary-link-button" style={{ background: getLocationColor(participantLocation) }}>
                {t("common.continue")}
              </a>
            </div>
          </section>
        )}
        </StepTransition>
      </section>
    </main>
  );
}
