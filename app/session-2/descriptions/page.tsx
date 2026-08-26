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
import SealDescriptionModal from "@/components/SealDescriptionModal";
import { seededShuffle } from "@/lib/randomization";
import { getLocationColor, getSession2Options } from "@/lib/locations";
import { saveWithRetry } from "@/lib/saveWithRetry";
import { useLanguage } from "@/lib/i18n";
import { isCompleteRanking } from "@/lib/payloadValidation";
import { loadSurveyDraft, saveSurveyDraft } from "@/lib/surveyDraft";
import {
  getSealDefinitions,
  getSealNameKey,
  type SealDefinition,
} from "@/lib/seals";
import {
  createSessionClickRows,
  createSessionTwoPayload,
} from "@/lib/sessionPayloads";
import type {
  FinalConfirmationAttemptRecord,
  RankingSnapshotItem,
  RankingTrackingData,
  ReadingScreenVisitRecord,
  SealInteractionRecord,
  SealReadingInteractionRecord,
} from "@/lib/sessionTracking";

type SealReadingRecord = {
  sealId: string;
  sealName: string;
  openedAt: string;
};

type Step =
  | "transition"
  | "reading"
  | "agreement"
  | "ranking"
  | "final-confirmation"
  | "demographics"
  | "completed";

type SessionTwoDraft = {
  step: Step;
  readSealIds: string[];
  sealReadingRecords: SealReadingRecord[];
  activeSealId: string | null;
  completedRanking: RankingOption[];
  rankingClickLogs: ClickLogRow[];
  rankingTracking: RankingTrackingData | null;
  rankingProgress: RankingProgressDraft | null;
  agreedToDescriptions: string;
  rankingSealClicks: Record<string, number>;
  rankingSealClickRecords: { sealId: string; sealName: string; clickedAt: string }[];
  rankingSealInteractionRecords: SealInteractionRecord[];
  sealReadingInteractionRecords: SealReadingInteractionRecord[];
  readingScreenVisitRecords: ReadingScreenVisitRecord[];
  demographics: DemographicsData;
  readingStartedAt: string | null;
  currentReadingVisitStartedAt: string | null;
  allSealsFirstReadAt: string | null;
  firstOpenOrder: string[];
  readingSealOpenedAt: Omit<NonNullable<SessionTwoDraftRuntime["readingSealOpenedAt"]>, "openedAt"> & { openedAt: string } | null;
  rankingSealOpenedAt: Omit<NonNullable<SessionTwoDraftRuntime["rankingSealOpenedAt"]>, "openedAt"> & { openedAt: string } | null;
  finalConfirmationStartedAt: string | null;
};

type SessionTwoDraftRuntime = {
  readingSealOpenedAt: {
    sealId: string;
    sealName: string;
    openedAt: Date;
    firstOpen: boolean;
    firstOpenOrder?: number;
  } | null;
  rankingSealOpenedAt: {
    optionId: string;
    sealId: string;
    sealName: string;
    openedAt: Date;
  } | null;
};

const EMPTY_DEMOGRAPHICS: DemographicsData = {
  gender: "",
  ageGroup: "",
  educationLevel: "",
  incomeGroup: "",
};

export default function SessionTwoDescriptionsPage() {
  const { t } = useLanguage();
  const [participantId, setParticipantId] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [step, setStep] = useState<Step>("transition");
  const [readSealIds, setReadSealIds] = useState<string[]>([]);
  const [sealReadingRecords, setSealReadingRecords] = useState<SealReadingRecord[]>([]);
  const [activeSeal, setActiveSeal] = useState<SealDefinition | null>(null);
  const [completedRanking, setCompletedRanking] = useState<RankingOption[]>([]);
  const [rankingClickLogs, setRankingClickLogs] = useState<ClickLogRow[]>([]);
  const [rankingTracking, setRankingTracking] =
    useState<RankingTrackingData | null>(null);
  const [agreedToDescriptions, setAgreedToDescriptions] = useState("");
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const [rankingSealClicks, setRankingSealClicks] = useState<Record<string, number>>({});
  const [rankingSealClickRecords, setRankingSealClickRecords] = useState<{ sealId: string; sealName: string; clickedAt: string }[]>([]);
  const [rankingSealInteractionRecords, setRankingSealInteractionRecords] =
    useState<SealInteractionRecord[]>([]);
  const [sealReadingInteractionRecords, setSealReadingInteractionRecords] =
    useState<SealReadingInteractionRecord[]>([]);
  const [readingScreenVisitRecords, setReadingScreenVisitRecords] =
    useState<ReadingScreenVisitRecord[]>([]);
  const [rankingProgress, setRankingProgress] =
    useState<RankingProgressDraft | null>(null);
  const [demographicsDraft, setDemographicsDraft] =
    useState<DemographicsData>(EMPTY_DEMOGRAPHICS);
  const [draftReady, setDraftReady] = useState(false);
  const savingFinalRef = useRef(false);
  const readingStartedAtRef = useRef<Date | null>(null);
  const currentReadingVisitStartedAtRef = useRef<Date | null>(null);
  const allSealsFirstReadAtRef = useRef<Date | null>(null);
  const firstOpenOrderRef = useRef<string[]>([]);
  const readingSealOpenedAtRef = useRef<{
    sealId: string;
    sealName: string;
    openedAt: Date;
    firstOpen: boolean;
    firstOpenOrder?: number;
  } | null>(null);
  const rankingSealOpenedAtRef = useRef<{
    optionId: string;
    sealId: string;
    sealName: string;
    openedAt: Date;
  } | null>(null);
  const finalConfirmationStartedAtRef = useRef<Date | null>(null);

  useEffect(() => {
    const storedParticipantId =
      localStorage.getItem("participantId") || "DEMO-PARTICIPANT";
    const storedLocation =
      localStorage.getItem("participantLocation") || "UNKNOWN";
    const draft = loadSurveyDraft<SessionTwoDraft>(
      "session-2",
      storedParticipantId,
      storedLocation
    );

    setParticipantId(storedParticipantId);
    setParticipantLocation(storedLocation);

    if (draft) {
      setStep(draft.step);
      setReadSealIds(draft.readSealIds ?? []);
      setSealReadingRecords(draft.sealReadingRecords ?? []);
      setCompletedRanking(draft.completedRanking ?? []);
      setRankingClickLogs(draft.rankingClickLogs ?? []);
      setRankingTracking(draft.rankingTracking ?? null);
      setRankingProgress(draft.rankingProgress ?? null);
      setAgreedToDescriptions(draft.agreedToDescriptions ?? "");
      setRankingSealClicks(draft.rankingSealClicks ?? {});
      setRankingSealClickRecords(draft.rankingSealClickRecords ?? []);
      setRankingSealInteractionRecords(draft.rankingSealInteractionRecords ?? []);
      setSealReadingInteractionRecords(draft.sealReadingInteractionRecords ?? []);
      setReadingScreenVisitRecords(draft.readingScreenVisitRecords ?? []);
      setDemographicsDraft(draft.demographics ?? EMPTY_DEMOGRAPHICS);
      setActiveSeal(
        getSealDefinitions(storedLocation).find(
          (seal) => seal.id === draft.activeSealId
        ) ?? null
      );
      readingStartedAtRef.current = draft.readingStartedAt
        ? new Date(draft.readingStartedAt)
        : null;
      currentReadingVisitStartedAtRef.current = draft.currentReadingVisitStartedAt
        ? new Date(draft.currentReadingVisitStartedAt)
        : null;
      allSealsFirstReadAtRef.current = draft.allSealsFirstReadAt
        ? new Date(draft.allSealsFirstReadAt)
        : null;
      firstOpenOrderRef.current = [...(draft.firstOpenOrder ?? [])];
      readingSealOpenedAtRef.current = draft.readingSealOpenedAt
        ? { ...draft.readingSealOpenedAt, openedAt: new Date(draft.readingSealOpenedAt.openedAt) }
        : null;
      rankingSealOpenedAtRef.current = draft.rankingSealOpenedAt
        ? { ...draft.rankingSealOpenedAt, openedAt: new Date(draft.rankingSealOpenedAt.openedAt) }
        : null;
      finalConfirmationStartedAtRef.current = draft.finalConfirmationStartedAt
        ? new Date(draft.finalConfirmationStartedAt)
        : null;
    }

    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (step === "final-confirmation") {
      finalConfirmationStartedAtRef.current ??= new Date();
    }

    if (step === "reading") {
      const startedAt = new Date();
      readingStartedAtRef.current ??= startedAt;
      currentReadingVisitStartedAtRef.current ??= startedAt;
    }
  }, [step]);

  useEffect(() => {
    if (!draftReady || !participantId) return;

    const readingSealOpenedAt = readingSealOpenedAtRef.current;
    const rankingSealOpenedAt = rankingSealOpenedAtRef.current;
    saveSurveyDraft<SessionTwoDraft>(
      "session-2",
      participantId,
      participantLocation,
      {
        step,
        readSealIds,
        sealReadingRecords,
        activeSealId: activeSeal?.id ?? null,
        completedRanking,
        rankingClickLogs,
        rankingTracking,
        rankingProgress,
        agreedToDescriptions,
        rankingSealClicks,
        rankingSealClickRecords,
        rankingSealInteractionRecords,
        sealReadingInteractionRecords,
        readingScreenVisitRecords,
        demographics: demographicsDraft,
        readingStartedAt: readingStartedAtRef.current?.toISOString() ?? null,
        currentReadingVisitStartedAt:
          currentReadingVisitStartedAtRef.current?.toISOString() ?? null,
        allSealsFirstReadAt: allSealsFirstReadAtRef.current?.toISOString() ?? null,
        firstOpenOrder: [...firstOpenOrderRef.current],
        readingSealOpenedAt: readingSealOpenedAt
          ? { ...readingSealOpenedAt, openedAt: readingSealOpenedAt.openedAt.toISOString() }
          : null,
        rankingSealOpenedAt: rankingSealOpenedAt
          ? { ...rankingSealOpenedAt, openedAt: rankingSealOpenedAt.openedAt.toISOString() }
          : null,
        finalConfirmationStartedAt:
          finalConfirmationStartedAtRef.current?.toISOString() ?? null,
      }
    );
  }, [
    activeSeal,
    agreedToDescriptions,
    completedRanking,
    demographicsDraft,
    draftReady,
    participantId,
    participantLocation,
    rankingClickLogs,
    rankingProgress,
    rankingSealClickRecords,
    rankingSealClicks,
    rankingSealInteractionRecords,
    rankingTracking,
    readSealIds,
    readingScreenVisitRecords,
    sealReadingInteractionRecords,
    sealReadingRecords,
    step,
  ]);

  const seals = getSealDefinitions(participantLocation);

  const randomizationSeed = useMemo(() => {
    return participantId ? `${participantId}-session-2` : "demo-session-2";
  }, [participantId]);

  const randomizedOptions = useMemo(() => {
    const baseOptions = getSession2Options(participantLocation);
    return seededShuffle(baseOptions, randomizationSeed);
  }, [randomizationSeed, participantLocation]);

  const randomizedReadingSeals = useMemo(() => {
    return seededShuffle(
      seals,
      `${participantId || "demo"}-${participantLocation || "unknown"}-session-2-seal-reading`
    );
  }, [seals, participantId, participantLocation]);


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

  const allSealsRead = readSealIds.length === seals.length;

  function openSealDescription(seal: SealDefinition) {
    const openedAt = new Date();
    setActiveSeal(seal);

    if (!readSealIds.includes(seal.id)) {
      firstOpenOrderRef.current.push(seal.id);
      const firstOpenOrder = firstOpenOrderRef.current.length;
      setReadSealIds((current) => [...current, seal.id]);

      setSealReadingRecords((current) => [
        ...current,
        {
          sealId: seal.id,
          sealName: t(seal.fullNameKey),
          openedAt: openedAt.toISOString(),
        },
      ]);

      if (firstOpenOrder === seals.length) {
        allSealsFirstReadAtRef.current = openedAt;
      }

      if (step === "reading") {
        readingSealOpenedAtRef.current = {
          sealId: seal.id,
          sealName: t(seal.fullNameKey),
          openedAt,
          firstOpen: true,
          firstOpenOrder,
        };
      }
    } else if (step === "reading") {
      readingSealOpenedAtRef.current = {
        sealId: seal.id,
        sealName: t(seal.fullNameKey),
        openedAt,
        firstOpen: false,
      };
    }
  }

  function closeSealDescription() {
    const openInteraction = rankingSealOpenedAtRef.current;
    const readingInteraction = readingSealOpenedAtRef.current;

    if (readingInteraction) {
      const closedAt = new Date();
      setSealReadingInteractionRecords((current) => [
        ...current,
        {
          sealId: readingInteraction.sealId,
          sealName: readingInteraction.sealName,
          openedAt: readingInteraction.openedAt.toISOString(),
          closedAt: closedAt.toISOString(),
          durationMs: Math.max(
            0,
            closedAt.getTime() - readingInteraction.openedAt.getTime()
          ),
          firstOpen: readingInteraction.firstOpen,
          firstOpenOrder: readingInteraction.firstOpenOrder,
        },
      ]);
      readingSealOpenedAtRef.current = null;
    }

    if (openInteraction) {
      const closedAt = new Date();
      setRankingSealInteractionRecords((current) => [
        ...current,
        {
          optionId: openInteraction.optionId,
          sealId: openInteraction.sealId,
          sealName: openInteraction.sealName,
          openedAt: openInteraction.openedAt.toISOString(),
          closedAt: closedAt.toISOString(),
          durationMs: Math.max(
            0,
            closedAt.getTime() - openInteraction.openedAt.getTime()
          ),
        },
      ]);
      rankingSealOpenedAtRef.current = null;
    }

    setActiveSeal(null);
  }

  function handleReadingContinue() {
    if (!allSealsRead) return;

    const completedAt = new Date();
    const startedAt = currentReadingVisitStartedAtRef.current ?? completedAt;
    setReadingScreenVisitRecords((current) => [
      ...current,
      {
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
      },
    ]);
    currentReadingVisitStartedAtRef.current = null;
    setStep("agreement");
  }

  function handleAgreementYes() {
    setAgreedToDescriptions("Yes");
    setStep("ranking");
  }

  function handleAgreementNo() {
    setAgreedToDescriptions("No");
    setStep("reading");
  }

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
    const updatedTracking: RankingTrackingData = {
      ...rankingTracking,
      finalConfirmationAttempts: [
        ...(rankingTracking.finalConfirmationAttempts ?? []),
        {
          ranking: createRankingSnapshot(completedRanking),
          startedAt: startedAt.toISOString(),
          respondedAt: respondedAt.toISOString(),
          durationMs: Math.max(
            0,
            respondedAt.getTime() - startedAt.getTime()
          ),
          response,
        },
      ],
    };

    setRankingTracking(updatedTracking);
    return updatedTracking;
  }

  async function handleFinalConfirmationYes() {
    if (savingFinalRef.current) return;

    if (!isCompleteRanking(completedRanking, 5) || !allSealsRead) {
      alert(t("common.validationError"));
      setStep(allSealsRead ? "ranking" : "reading");
      return;
    }

    const completedTracking = recordFinalConfirmation("Yes");

    const surveyMode = localStorage.getItem("surveyMode");

    if (surveyMode === "full") {
      savingFinalRef.current = true;
      setIsSavingFinal(true);

      try {
        await saveSessionTwoWithoutQuestionnaire(
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

  function getSealById(sealId?: string) {
    return seals.find((seal) => seal.id === sealId) || null;
  }

  async function saveSessionTwoData(
    demographics: DemographicsData,
    options: {
      saveDemographicsLocally: boolean;
    },
    trackingOverride?: RankingTrackingData
  ) {
    const timestamp = new Date().toISOString();
    const activeTracking = trackingOverride ?? rankingTracking;
    const {
      participantRow,
      longRows,
      sealReadingRows,
      rankingSealClickRows,
      decisionAttemptRows,
      rankingSealInteractionRows,
      sealReadingInteractionRows,
      readingScreenVisitRows,
      preselectionReorderRows,
      finalConfirmationRows,
      rankingRevisionRows,
      revisionReorderRows,
    } = createSessionTwoPayload({
      participantId,
      participantLocation,
      randomizationSeed,
      ranking: completedRanking,
      initialDisplayOrder: translatedOptions,
      demographics,
      timestamp,
      agreedToDescriptions,
      readSealCount: readSealIds.length,
      allSealsRead,
      sealReadingDisplayOrder: randomizedReadingSeals.map((seal) => ({
        sealId: seal.id,
        sealName: t(seal.shortNameKey),
      })),
      sealReadingRecords,
      rankingSealClickRecords,
      rankingSealClicks,
      rankingSealInteractionRecords,
      sealReadingInteractionRecords,
      readingScreenVisitRecords,
      readingStartedAt: readingStartedAtRef.current?.toISOString(),
      allSealsFirstReadAt:
        allSealsFirstReadAtRef.current?.toISOString(),
      tracking: activeTracking
        ? {
            ...activeTracking,
            sessionCompletedAt: timestamp,
          }
        : undefined,
    });
    const clickRows = createSessionClickRows(
      rankingClickLogs,
      participantId,
      participantLocation,
      2,
      timestamp
    );

    const result = await saveWithRetry("/api/session-2/save", {
      participantRow,
      longRows,
      sealReadingRows,
      rankingSealClickRows,
      decisionAttemptRows,
      rankingSealInteractionRows,
      sealReadingInteractionRows,
      readingScreenVisitRows,
      preselectionReorderRows,
      finalConfirmationRows,
      rankingRevisionRows,
      revisionReorderRows,
    });

    if (result.validationError) {
      alert(t("common.validationError"));
      setStep(isCompleteRanking(completedRanking, 5) ? "reading" : "ranking");
      return;
    }

    if (clickRows.length > 0) {
      await saveWithRetry("/api/click-logs/save", { clickRows });
    }

    localStorage.setItem("session-2-ranking", JSON.stringify(longRows));
    localStorage.setItem(
      "session-2-seal-readings",
      JSON.stringify(sealReadingRows)
    );

    if (options.saveDemographicsLocally) {
      localStorage.setItem(
        "session-2-demographics",
        JSON.stringify(demographics)
      );
    }

    if (result.queued) {
      alert(t("common.saveAlert"));
    }

    setStep("completed");
  }

  async function saveSessionTwoWithoutQuestionnaire(
    trackingOverride?: RankingTrackingData
  ) {
    await saveSessionTwoData(
      {
        gender: "Collected in Session 3",
        ageGroup: "Collected in Session 3",
        educationLevel: "Collected in Session 3",
        incomeGroup: "Collected in Session 3",
      },
      {
        saveDemographicsLocally: false,
      },
      trackingOverride
    );
  }

  async function saveSessionTwo(demographics: DemographicsData) {
    await saveSessionTwoData(demographics, {
      saveDemographicsLocally: true,
    });
  }

  return (
    <main className={`study-page location-${participantLocation.toLowerCase()}`}>
      <section className="study-shell">
        <StepTransition stepKey={step}>
        {step === "transition" && (
          <section className="complete-card session-transition-card">
            <div className="badge" style={{ background: getLocationColor(participantLocation) }}>{t("s2.introBadge")}</div>
            <h2>{t("s2.introTitle")}</h2>
            <p>
              {t("s2.introDesc")}
            </p>
            <button
              type="button"
              className="primary-button full-width-button"
              style={{ background: getLocationColor(participantLocation) }}
              onClick={() => setStep("reading")}
            >
              {t("common.continue")}
            </button>
          </section>
        )}

        {step === "reading" && (
          <section className="session-two-card">
            <div className="session-two-heading">
              <div>
                <p className="session-two-step-label">
                  {t("common.session")} 2
                </p>
                <h2>{t("s2.readTitle")}</h2>
                <p>
                  {t("s2.readDesc")}
                </p>
              </div>

            </div>

            <div className="seal-description-grid">
              {randomizedReadingSeals.map((seal) => {
                return (
                  <button
                    key={seal.id}
                    type="button"
                    className="seal-description-card"
                    onClick={() => openSealDescription(seal)}
                  >
                    <div className="seal-image-holder">
                      <img src={seal.imageUrl} alt={t(seal.fullNameKey)} />
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={allSealsRead ? "purchase-button" : "purchase-button disabled"}
              style={allSealsRead ? { background: getLocationColor(participantLocation) } : undefined}
              onClick={() => {
                handleReadingContinue();
              }}
            >
              {allSealsRead
                ? t("s2.continueReady")
                : (
                  <>
                    <span>{t("s2.continueBlocked")}</span>
                    <span className="button-progress-count">
                      ({readSealIds.length}/{seals.length} {t("s2.readCount")})
                    </span>
                  </>
                )}
            </button>
          </section>
        )}

        {step === "agreement" && (
          <section className="complete-card seal-agreement-card">
            {participantLocation === "NMSU" && (
              <div className="badge" style={{ background: getLocationColor(participantLocation) }}>{t("s2.confirmBadge")}</div>
            )}
            <h2>{t("s2.confirmTitle")}</h2>
            <p>
              {t("s2.confirmDesc")}
            </p>

            <div className="final-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleAgreementNo}
              >
                {t("s2.no")}
              </button>

              <button
                type="button"
                className="primary-button"
                style={{ background: getLocationColor(participantLocation) }}
                onClick={handleAgreementYes}
              >
                {t("s2.yes")}
              </button>
            </div>
          </section>
        )}

        {step === "ranking" && (
          <section className="session-two-ranking-note">
            <RankingScreen
              key={`${participantLocation}-${randomizationSeed}`}
              options={translatedOptions}
              sessionNumber={2}
              showSessionLabel={false}
              title={t("s2.rankingTitle")}
              description={t("s2.rankingDesc")}
              location={participantLocation}
              participantId={participantId}
              initialRanking={completedRanking}
              initialClickLogs={rankingClickLogs}
              initialTracking={rankingTracking ?? undefined}
              initialProgress={rankingProgress ?? undefined}
              onProgressChange={setRankingProgress}
              onRankingComplete={handleRankingComplete}
              onSealClick={(sealId) => {
                const seal = getSealById(sealId);
                if (seal) {
                  const openedAt = new Date();
                  rankingSealOpenedAtRef.current = {
                    optionId:
                      translatedOptions.find(
                        (option) => option.sealId === seal.id
                      )?.id || "",
                    sealId: seal.id,
                    sealName: t(seal.fullNameKey),
                    openedAt,
                  };
                  openSealDescription(seal);
                  setRankingSealClicks((prev) => ({ ...prev, [seal.id]: (prev[seal.id] || 0) + 1 }));
                  setRankingSealClickRecords((prev) => [...prev, { sealId: seal.id, sealName: t(seal.fullNameKey), clickedAt: openedAt.toISOString() }]);
                }
              }}
            />
          </section>
        )}

        {step === "final-confirmation" && (
          <section className="complete-card final-confirmation-card">
            {participantLocation === "NMSU" && (
              <div className="badge" style={{ background: getLocationColor(participantLocation) }}>{t("s2.finalBadge")}</div>
            )}
            <h2>{t("s2.finalTitle")}</h2>
            <p>
              {t("s2.finalDesc")}
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
                {t("s2.finalNo")}
              </button>

              <button
                type="button"
                className="primary-button"
                style={{ background: getLocationColor(participantLocation) }}
                onClick={handleFinalConfirmationYes}
                disabled={isSavingFinal}
              >
                {isSavingFinal ? t("s2.saving") : t("s2.finalYes")}
              </button>
            </div>
          </section>
        )}

        {step === "demographics" && (
          <section className="complete-card demographics-card">
            <DemographicsForm
              onSubmit={saveSessionTwo}
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
            <h2>{t("s2.completedTitle")}</h2>
            <p>{t("common.clickContinue1")} <strong>{t("common.continue")}</strong> {t("common.clickContinue2")}</p>

            <div className="final-actions" style={{ gridTemplateColumns: "1fr" }}>
              <a href="/session-3" className="primary-link-button" style={{ background: getLocationColor(participantLocation) }}>
                {t("common.continue")}
              </a>
            </div>
          </section>
        )}
        </StepTransition>
      </section>

      {activeSeal && (
        <SealDescriptionModal
          imageUrl={activeSeal.imageUrl}
          name={t(activeSeal.fullNameKey)}
          description={t(activeSeal.descriptionKey)}
          buttonLabel={t("s2.readBtn")}
          color={getLocationColor(participantLocation)}
          onClose={closeSealDescription}
        />
      )}
    </main>
  );
}
