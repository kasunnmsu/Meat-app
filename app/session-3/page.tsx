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
import { saveWithRetry } from "@/lib/saveWithRetry";
import { useLanguage } from "@/lib/i18n";
import { getLocationColor, getLocationConfig } from "@/lib/locations";
import { isCompleteRanking } from "@/lib/payloadValidation";
import { calculatePrice, PRICE_CONDITIONS } from "@/lib/pricing";
import { getSealDefinitions, type SealDefinition } from "@/lib/seals";
import {
  calculateParticipantTopSeals,
  FALLBACK_TOP_SEALS,
  type SealRankingRow,
} from "@/lib/topSeals";
import { createSessionThreeTrackingPayload } from "@/lib/sessionPayloads";
import {
  clearSurveyDraft,
  loadSurveyDraft,
  saveSurveyDraft,
} from "@/lib/surveyDraft";
import type {
  BetweenScreenVisitRecord,
  FinalConfirmationAttemptRecord,
  RankingSnapshotItem,
  RankingTrackingData,
  SealInteractionRecord,
} from "@/lib/sessionTracking";
import Link from "next/link";

type Step =
  | "transition"
  | "ranking"
  | "final-confirmation"
  | "between-screens"
  | "pre-demographics"
  | "demographics"
  | "completed";

type ActiveSealInteractionDraft = {
  screenIndex: number;
  optionId: string;
  sealId: string;
  sealName: string;
  openedAt: string;
};

type SessionThreeDraft = {
  step: Step;
  activeSealId: string | null;
  topThreeSealIds: string[];
  currentScreenIndex: number;
  screenRankings: RankingOption[][];
  screenClickLogs: ClickLogRow[][];
  screenTrackings: Array<RankingTrackingData | undefined>;
  screenProgresses: Array<RankingProgressDraft | undefined>;
  demographics: DemographicsData;
  finalConfirmationStartedAt: string | null;
  betweenScreenStartedAt: string | null;
  betweenScreenVisits: BetweenScreenVisitRecord[];
  screenSealInteractions: SealInteractionRecord[][];
  activeSealInteraction: ActiveSealInteractionDraft | null;
};

const EMPTY_DEMOGRAPHICS: DemographicsData = {
  gender: "",
  ageGroup: "",
  educationLevel: "",
  incomeGroup: "",
};

function getTopThreeSealsFromPreviousChoices(
  participantId: string,
  location: string
) {
  try {
    const sessionOneRaw = localStorage.getItem("session-1-ranking");
    const sessionTwoRaw = localStorage.getItem("session-2-ranking");

    const sessionOneRows = sessionOneRaw
      ? JSON.parse(sessionOneRaw)
      : [];

    const sessionTwoRows = sessionTwoRaw
      ? JSON.parse(sessionTwoRaw)
      : [];

    if (!Array.isArray(sessionOneRows) || !Array.isArray(sessionTwoRows)) {
      return null;
    }

    return calculateParticipantTopSeals(
      sessionOneRows as SealRankingRow[],
      sessionTwoRows as SealRankingRow[],
      participantId,
      location
    )?.topSealIds ?? null;
  } catch (error) {
    console.error("Could not calculate weighted top seals:", error);
    return null;
  }
}

function hasSameSealOrder(first: string[], second: string[]) {
  return (
    first.length === second.length &&
    first.every((sealId, index) => sealId === second[index])
  );
}

export default function SessionThreePage() {
  const { t } = useLanguage();
  const [participantId, setParticipantId] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [step, setStep] = useState<Step>("transition");
  const [activeSeal, setActiveSeal] = useState<SealDefinition | null>(null);
  const [topThreeSealIds, setTopThreeSealIds] = useState<string[]>(FALLBACK_TOP_SEALS);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [screenRankings, setScreenRankings] = useState<RankingOption[][]>([]);
  const [screenClickLogs, setScreenClickLogs] = useState<ClickLogRow[][]>([]);
  const [screenTrackings, setScreenTrackings] = useState<
    Array<RankingTrackingData | undefined>
  >([]);
  const [screenProgresses, setScreenProgresses] = useState<
    Array<RankingProgressDraft | undefined>
  >([]);
  const [demographicsDraft, setDemographicsDraft] =
    useState<DemographicsData>(EMPTY_DEMOGRAPHICS);
  const [draftReady, setDraftReady] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advancingRef = useRef(false);
  const finalConfirmationStartedAtRef = useRef<Date | null>(null);
  const betweenScreenStartedAtRef = useRef<Date | null>(null);
  const betweenScreenVisitsRef = useRef<BetweenScreenVisitRecord[]>([]);
  const screenSealInteractionsRef = useRef<SealInteractionRecord[][]>([]);
  const activeSealInteractionRef = useRef<{
    screenIndex: number;
    optionId: string;
    sealId: string;
    sealName: string;
    openedAt: Date;
  } | null>(null);

  useEffect(() => {
    async function loadParticipantAndTopSeals() {
      const id = localStorage.getItem("participantId") || "DEMO-PARTICIPANT";
      const location = localStorage.getItem("participantLocation") || "UNKNOWN";
      const draft = loadSurveyDraft<SessionThreeDraft>(
        "session-3",
        id,
        location
      );

      setParticipantId(id);
      setParticipantLocation(location);

      const localTopSealIds = getTopThreeSealsFromPreviousChoices(
        id,
        location
      );

      if (draft) {
        if (
          localTopSealIds &&
          !hasSameSealOrder(draft.topThreeSealIds ?? [], localTopSealIds)
        ) {
          clearSurveyDraft("session-3");
          setTopThreeSealIds(localTopSealIds);
          setDraftReady(true);
          return;
        }

        setStep(draft.step);
        setTopThreeSealIds(draft.topThreeSealIds ?? FALLBACK_TOP_SEALS);
        setCurrentScreenIndex(draft.currentScreenIndex ?? 0);
        setScreenRankings(draft.screenRankings ?? []);
        setScreenClickLogs(draft.screenClickLogs ?? []);
        setScreenTrackings(draft.screenTrackings ?? []);
        setScreenProgresses(draft.screenProgresses ?? []);
        setDemographicsDraft(draft.demographics ?? EMPTY_DEMOGRAPHICS);
        setActiveSeal(
          getSealDefinitions(location).find(
            (seal) => seal.id === draft.activeSealId
          ) ?? null
        );
        finalConfirmationStartedAtRef.current = draft.finalConfirmationStartedAt
          ? new Date(draft.finalConfirmationStartedAt)
          : null;
        betweenScreenStartedAtRef.current = draft.betweenScreenStartedAt
          ? new Date(draft.betweenScreenStartedAt)
          : null;
        betweenScreenVisitsRef.current = [...(draft.betweenScreenVisits ?? [])];
        screenSealInteractionsRef.current = [
          ...(draft.screenSealInteractions ?? []),
        ];
        activeSealInteractionRef.current = draft.activeSealInteraction
          ? {
              ...draft.activeSealInteraction,
              openedAt: new Date(draft.activeSealInteraction.openedAt),
            }
          : null;
        setDraftReady(true);
        return;
      }

      if (localTopSealIds) {
        setTopThreeSealIds(localTopSealIds);
        setDraftReady(true);
        return;
      }

      try {
        const response = await fetch(
          `/api/session-3/top-seals?participantId=${encodeURIComponent(id)}&location=${encodeURIComponent(location)}`
        );

        if (!response.ok) {
          setTopThreeSealIds(FALLBACK_TOP_SEALS);
          return;
        }

        const data = await response.json();

        const apiHasParticipantData =
          data.hasParticipantData === true ||
          (data.weightedScores &&
            typeof data.weightedScores === "object" &&
            Object.keys(data.weightedScores).length > 0);

        if (
          apiHasParticipantData &&
          Array.isArray(data.topSealIds) &&
          data.topSealIds.length >= 3
        ) {
          setTopThreeSealIds(data.topSealIds.slice(0, 3));
        } else {
          setTopThreeSealIds(FALLBACK_TOP_SEALS);
        }
      } catch {
        setTopThreeSealIds(FALLBACK_TOP_SEALS);
      } finally {
        setDraftReady(true);
      }
    }

    loadParticipantAndTopSeals();
  }, []);

  useEffect(() => {
    if (step === "final-confirmation") {
      finalConfirmationStartedAtRef.current ??= new Date();
    }
  }, [step]);

  useEffect(() => {
    if (!draftReady || !participantId) return;

    const activeInteraction = activeSealInteractionRef.current;
    saveSurveyDraft<SessionThreeDraft>(
      "session-3",
      participantId,
      participantLocation,
      {
        step,
        activeSealId: activeSeal?.id ?? null,
        topThreeSealIds,
        currentScreenIndex,
        screenRankings,
        screenClickLogs,
        screenTrackings,
        screenProgresses,
        demographics: demographicsDraft,
        finalConfirmationStartedAt:
          finalConfirmationStartedAtRef.current?.toISOString() ?? null,
        betweenScreenStartedAt:
          betweenScreenStartedAtRef.current?.toISOString() ?? null,
        betweenScreenVisits: [...betweenScreenVisitsRef.current],
        screenSealInteractions: [...screenSealInteractionsRef.current],
        activeSealInteraction: activeInteraction
          ? { ...activeInteraction, openedAt: activeInteraction.openedAt.toISOString() }
          : null,
      }
    );
  }, [
    activeSeal,
    currentScreenIndex,
    demographicsDraft,
    draftReady,
    participantId,
    participantLocation,
    screenClickLogs,
    screenProgresses,
    screenRankings,
    screenTrackings,
    step,
    topThreeSealIds,
  ]);

  const sealDefinitions = useMemo(
    () => getSealDefinitions(participantLocation),
    [participantLocation]
  );

  const cutImageUrl = participantLocation === "UFBA"
    ? "/images/cuts/12.png"
    : participantLocation === "NMSU"
    ? "/images/cuts/14.png"
    : "/images/cuts/13.png";

  const cutTitle = participantLocation === "NMSU" ? t("s3.cutTitleNmsu") : t("s3.cutTitle");

  const priceConfig = useMemo(
    () => getLocationConfig(participantLocation),
    [participantLocation]
  );

  const randomizationSeed = useMemo(() => {
    return participantId ? `${participantId}-session-3` : "demo-session-3";
  }, [participantId]);

  const allScreensOptions = useMemo(() => {
    const selectedSeals = topThreeSealIds
      .map((sealId) =>
        sealDefinitions.find((seal) => seal.id === sealId)
      )
      .filter(Boolean) as SealDefinition[];

    if (selectedSeals.length < 3) {
      return [];
    }

    const conditionScreens = PRICE_CONDITIONS.map((condition) => {
      const conditionOptions: RankingOption[] = selectedSeals.map(
        (seal, sealIndex) => {
          const priceLevel = condition.prices[sealIndex];
          const price = calculatePrice(
            priceConfig.basePrice,
            priceLevel.priceIncreasePercent
          );

          return {
            id: `session-3-condition-${condition.conditionId}-${seal.id}-${priceLevel.priceIncreasePercent}`,
            cutId: `price-cut-${sealIndex + 1}`,
            sealId: seal.id,
            title: cutTitle,
            subtitle: t(seal.shortNameKey),
            cutImageUrl,
            sealImageUrl: seal.imageUrl,
            sealColor: seal.color,
            price,
            priceCurrency: priceConfig.currencyCode,
            priceCurrencySymbol: priceConfig.currencySymbol,
            priceUnit: priceConfig.unit,
            priceUnitLabel: priceConfig.priceUnit,
            priceLocale: priceConfig.locale,
            priceIncreasePercent:
              priceLevel.priceIncreasePercent,
            priceLevel: priceLevel.priceLevel,
            conditionId: condition.conditionId,
          };
        }
      );

      return {
        conditionId: condition.conditionId,
        options: seededShuffle(
          conditionOptions,
          `${randomizationSeed}-condition-${condition.conditionId}`
        ),
      };
    });

    return seededShuffle(
      conditionScreens,
      `${randomizationSeed}-condition-order`
    );
  }, [
    topThreeSealIds,
    randomizationSeed,
    sealDefinitions,
    cutImageUrl,
    cutTitle,
    priceConfig,
    t,
  ]);

  function getSealById(sealId?: string) {
    return sealDefinitions.find((seal) => seal.id === sealId) || null;
  }

  function handleRankingComplete(
    ranking: RankingOption[],
    clickLogs: ClickLogRow[] = [],
    tracking?: RankingTrackingData
  ) {
    const newRankings = [...screenRankings];
    const newClickLogs = [...screenClickLogs];
    const newTrackings = [...screenTrackings];
    const modalSealInteractions =
      screenSealInteractionsRef.current[currentScreenIndex] ?? [];

    newRankings[currentScreenIndex] = ranking;
    newClickLogs[currentScreenIndex] = clickLogs;
    newTrackings[currentScreenIndex] = tracking
      ? {
          ...tracking,
          sealInteractions: [
            ...tracking.sealInteractions,
            ...modalSealInteractions,
          ],
        }
      : undefined;
    screenSealInteractionsRef.current[currentScreenIndex] = [];

    setScreenRankings(newRankings);
    setScreenClickLogs(newClickLogs);
    setScreenTrackings(newTrackings);
    setScreenProgresses((current) => {
      const nextProgresses = [...current];
      nextProgresses[currentScreenIndex] = undefined;
      return nextProgresses;
    });

    advancingRef.current = false;
    setIsAdvancing(false);

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
    const tracking = screenTrackings[currentScreenIndex];

    if (!tracking) return null;

    const respondedAt = new Date();
    const startedAt = finalConfirmationStartedAtRef.current ?? respondedAt;
    const updatedTracking: RankingTrackingData = {
      ...tracking,
      finalConfirmationAttempts: [
        ...(tracking.finalConfirmationAttempts ?? []),
        {
          ranking: createRankingSnapshot(
            screenRankings[currentScreenIndex] ?? []
          ),
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
    const newTrackings = [...screenTrackings];
    newTrackings[currentScreenIndex] = updatedTracking;
    setScreenTrackings(newTrackings);
    return updatedTracking;
  }

  function handleFinalConfirmationNo() {
    recordFinalConfirmation("No");
    finalConfirmationStartedAtRef.current = null;
    setStep("ranking");
  }

  function handleFinalConfirmationYes() {
    recordFinalConfirmation("Yes");

    if (currentScreenIndex < 2) {
      betweenScreenStartedAtRef.current = new Date();
      setStep("between-screens");
    } else {
      setStep("pre-demographics");
    }
  }

  function closeActiveSeal() {
    const interaction = activeSealInteractionRef.current;

    if (interaction) {
      const closedAt = new Date();
      const screenInteractions =
        screenSealInteractionsRef.current[interaction.screenIndex] ?? [];

      screenSealInteractionsRef.current[interaction.screenIndex] = [
        ...screenInteractions,
        {
          optionId: interaction.optionId,
          sealId: interaction.sealId,
          sealName: interaction.sealName,
          openedAt: interaction.openedAt.toISOString(),
          closedAt: closedAt.toISOString(),
          durationMs: Math.max(
            0,
            closedAt.getTime() - interaction.openedAt.getTime()
          ),
        },
      ];
      activeSealInteractionRef.current = null;
    }

    setActiveSeal(null);
  }

  function handleContinueToNextScreen() {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setIsAdvancing(true);
    const completedAt = new Date();
    const startedAt = betweenScreenStartedAtRef.current ?? completedAt;

    betweenScreenVisitsRef.current.push({
      fromScreen: currentScreenIndex + 1,
      toScreen: currentScreenIndex + 2,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
    });
    betweenScreenStartedAtRef.current = null;
    setCurrentScreenIndex((prev) => prev + 1);
    setStep("ranking");
  }

  async function saveSessionThree(demographics: DemographicsData) {
    const incompleteScreenIndex = [0, 1, 2].find(
      (index) => !isCompleteRanking(screenRankings[index], 3)
    );

    if (incompleteScreenIndex !== undefined) {
      alert(t("common.validationError"));
      setCurrentScreenIndex(incompleteScreenIndex);
      setStep("ranking");
      return;
    }

    const unconfirmedScreenIndex = [0, 1, 2].find((index) => {
      const attempts = screenTrackings[index]?.finalConfirmationAttempts ?? [];
      return attempts.at(-1)?.response !== "Yes";
    });

    if (unconfirmedScreenIndex !== undefined) {
      alert(t("common.validationError"));
      setCurrentScreenIndex(unconfirmedScreenIndex);
      setStep("final-confirmation");
      return;
    }

    const timestamp = new Date().toISOString();
    const surveyStartedAt =
      localStorage.getItem("surveyStartedAt") ||
      screenTrackings[0]?.rankingStartedAt ||
      timestamp;

    const longRows = screenRankings.flatMap((ranking, screenIdx) =>
      ranking.map((option, rankIdx) => ({
        participant_id: participantId,
        location: participantLocation,
        session_number: 3,
        method: "3 cuts x 3 prices price experiment with 3 screens",
        base_price: priceConfig.basePrice,
        base_price_brl:
          priceConfig.currencyCode === "BRL" ? priceConfig.basePrice : "",
        base_price_currency: priceConfig.currencyCode,
        base_price_unit: priceConfig.unit,
        session_1_weight: 0.33,
        session_2_weight: 0.67,
        randomization_seed: randomizationSeed,
        presentation_screen_number: screenIdx + 1,
        condition_id:
          allScreensOptions[screenIdx]?.conditionId || "",
        selected_rank: rankIdx + 1,
        option_id: option.id,
        cut_id: option.cutId || "",
        seal_id: option.sealId || "",
        title: option.title,
        subtitle: option.subtitle || "",
        cut_image_url: option.cutImageUrl || "",
        seal_image_url: option.sealImageUrl || "",
        seal_color: option.sealColor || "",
        price: option.price || "",
        price_brl:
          option.priceCurrency === "BRL" ? option.price || "" : "",
        price_currency: option.priceCurrency || "",
        price_unit: option.priceUnit || "",
        price_increase_percent: option.priceIncreasePercent || "",
        screen_started_at: option.screenStartedAt ?? "",
        option_selected_at: option.optionSelectedAt ?? "",
        purchase_confirmed_at: option.purchaseConfirmedAt ?? "",
        time_spent_before_choice_ms: option.timeSpentBeforeChoiceMs ?? "",
        time_spent_before_choice_seconds:
          option.timeSpentBeforeChoiceSeconds ?? "",
        time_taken_to_confirm_ms: option.timeTakenToConfirmMs ?? "",
        time_taken_to_confirm_seconds:
          option.timeTakenToConfirmSeconds ?? "",
        changed_preference_before_confirming:
          option.changedPreferenceBeforeConfirming ?? "",
        initial_selected_option_id: option.initialSelectedOptionId ?? "",
        final_confirmed_option_id: option.finalConfirmedOptionId ?? "",
        top_three_seals_used: topThreeSealIds.join(", "),
        gender: demographics.gender,
        age_group: demographics.ageGroup,
        education_level: demographics.educationLevel,
        income_group: demographics.incomeGroup,
        timestamp,
      }))
    );

    const participantRow: Record<string, string | number> = {
      participant_id: participantId,
      location: participantLocation,
      session_number: 3,
      method: "3 cuts x 3 prices price experiment with 3 screens",
      base_price: priceConfig.basePrice,
      base_price_brl:
        priceConfig.currencyCode === "BRL" ? priceConfig.basePrice : "",
      base_price_currency: priceConfig.currencyCode,
      base_price_unit: priceConfig.unit,
      session_1_weight: 0.33,
      session_2_weight: 0.67,
      randomization_seed: randomizationSeed,

      top_seal_1: topThreeSealIds[0] || "",
      top_seal_2: topThreeSealIds[1] || "",
      top_seal_3: topThreeSealIds[2] || "",

      gender: demographics.gender,
      age_group: demographics.ageGroup,
      education_level: demographics.educationLevel,
      income_group: demographics.incomeGroup,

      timestamp,
    };

    screenRankings.forEach((ranking, screenIdx) => {
      const screenNum = screenIdx + 1;

      participantRow[`screen_${screenNum}_condition_id`] =
        allScreensOptions[screenIdx]?.conditionId || "";

      ranking.forEach((option, rankIdx) => {
        const rankNum = rankIdx + 1;
        const prefix = `screen_${screenNum}_rank_${rankNum}`;
        participantRow[`${prefix}_option_id`] = option.id;
        participantRow[`${prefix}_seal_id`] = option.sealId || "";
        participantRow[`${prefix}_title`] = option.title;
        participantRow[`${prefix}_subtitle`] = option.subtitle || "";
        participantRow[`${prefix}_price_brl`] =
          option.priceCurrency === "BRL" ? option.price ?? "" : "";
        participantRow[`${prefix}_price`] = option.price ?? "";
        participantRow[`${prefix}_price_currency`] =
          option.priceCurrency ?? "";
        participantRow[`${prefix}_price_unit`] = option.priceUnit ?? "";
        participantRow[`${prefix}_price_increase_percent`] =
          option.priceIncreasePercent ?? "";

        participantRow[`${prefix}_screen_started_at`] =
          option.screenStartedAt ?? "";
        participantRow[`${prefix}_option_selected_at`] =
          option.optionSelectedAt ?? "";
        participantRow[`${prefix}_purchase_confirmed_at`] =
          option.purchaseConfirmedAt ?? "";
        participantRow[`${prefix}_time_spent_before_choice_ms`] =
          option.timeSpentBeforeChoiceMs ?? "";
        participantRow[`${prefix}_time_spent_before_choice_seconds`] =
          option.timeSpentBeforeChoiceSeconds ?? "";
        participantRow[`${prefix}_time_taken_to_confirm_ms`] =
          option.timeTakenToConfirmMs ?? "";
        participantRow[`${prefix}_time_taken_to_confirm_seconds`] =
          option.timeTakenToConfirmSeconds ?? "";
        participantRow[`${prefix}_changed_preference_before_confirming`] =
          option.changedPreferenceBeforeConfirming ?? "";
        participantRow[`${prefix}_initial_selected_option_id`] =
          option.initialSelectedOptionId ?? "";
        participantRow[`${prefix}_final_confirmed_option_id`] =
          option.finalConfirmedOptionId ?? "";
      });
    });

    const trackingPayload = createSessionThreeTrackingPayload({
      participantId,
      participantLocation,
      timestamp,
      screens: screenRankings.map((ranking, screenIdx) => ({
        screenNumber: screenIdx + 1,
        conditionId: allScreensOptions[screenIdx]?.conditionId || "",
        ranking,
        initialDisplayOrder: allScreensOptions[screenIdx]?.options ?? [],
        tracking: screenTrackings[screenIdx],
      })),
      betweenScreenVisits: betweenScreenVisitsRef.current,
    });

    Object.assign(participantRow, trackingPayload.participantFields);

    const clickRows = screenClickLogs.flatMap((screenRows, screenIdx) =>
      screenRows.map((row) => ({
        ...row,
        participant_id: participantId,
        location: participantLocation,
        session_number: 3,
        presentation_screen_number: screenIdx + 1,
        condition_id:
          allScreensOptions[screenIdx]?.conditionId ||
          row.condition_id ||
          "",
        timestamp,
      }))
    );

    const sessionResult = await saveWithRetry("/api/session-3/save", {
      participantRow,
      longRows,
      decisionAttemptRows: trackingPayload.decisionAttemptRows,
      sealInteractionRows: trackingPayload.sealInteractionRows,
      preselectionReorderRows: trackingPayload.preselectionReorderRows,
      finalConfirmationRows: trackingPayload.finalConfirmationRows,
      rankingRevisionRows: trackingPayload.rankingRevisionRows,
      revisionReorderRows: trackingPayload.revisionReorderRows,
    });

    if (sessionResult.validationError) {
      alert(t("common.validationError"));
      return;
    }

    if (clickRows.length > 0) {
      await saveWithRetry("/api/click-logs/save", {
        clickRows,
      });
    }

    localStorage.setItem("session-3-ranking", JSON.stringify(longRows));
    localStorage.setItem("session-3-demographics", JSON.stringify(demographics));

    const fullSurveyResult = await saveWithRetry("/api/full-survey/save", {
      participantId,
      location: participantLocation,
      demographics,
      surveyStartedAt,
      surveyCompletedAt: timestamp,
    });

    if (fullSurveyResult.validationError) {
      alert(t("common.validationError"));
      return;
    }

    if (sessionResult.queued || fullSurveyResult.queued) {
      alert(t("common.saveAlert"));
    }

    setStep("completed");
  }

  return (
    <main className={`study-page location-${participantLocation.toLowerCase()}`}>
      <section className="study-shell">
        <StepTransition stepKey={step}>
        {step === "transition" && (
          <section className="complete-card session-transition-card">
            <div className="badge" style={{ background: getLocationColor(participantLocation) }}>{t("s3.introBadge")}</div>
            <h2>{t("s3.introTitle")}</h2>
            <p>
              {t("s3.introDesc")}
            </p>
            <button
              type="button"
              className="primary-button full-width-button"
              style={{ background: getLocationColor(participantLocation) }}
              onClick={() => setStep("ranking")}
            >
              {t("common.continue")}
            </button>
          </section>
        )}

        {step === "ranking" &&
          allScreensOptions[currentScreenIndex]?.options && (
          <section className="session-three-ranking">
            <RankingScreen
              key={`${participantLocation}-screen-${currentScreenIndex}`}
              options={allScreensOptions[currentScreenIndex].options}
              sessionNumber={3}
              showSessionLabel={false}
              sessionSuffix={`${t("s3.choiceSuffix")} ${currentScreenIndex + 1} ${t("s3.choiceOf")} 3`}
              title={t("s3.rankingTitle")}
              progressLabel={`${t("s3.round")} ${currentScreenIndex + 1} ${t("s3.choiceOf")} 3`}
              description={t(
                currentScreenIndex === 0
                  ? "s3.rankingDesc"
                  : "s3.rankingDescLater"
              )}
              location={participantLocation}
              participantId={participantId}
              showPriceInCart
              initialRanking={screenRankings[currentScreenIndex] ?? []}
              initialClickLogs={screenClickLogs[currentScreenIndex] ?? []}
              initialTracking={screenTrackings[currentScreenIndex]}
              initialProgress={screenProgresses[currentScreenIndex]}
              onProgressChange={(progress) => {
                setScreenProgresses((current) => {
                  const nextProgresses = [...current];
                  nextProgresses[currentScreenIndex] = progress;
                  return nextProgresses;
                });
              }}
              onRankingComplete={handleRankingComplete}
              onSealClick={(sealId) => {
                const seal = getSealById(sealId);
                const option = allScreensOptions[
                  currentScreenIndex
                ]?.options.find((item) => item.sealId === sealId);

                if (seal && option) {
                  activeSealInteractionRef.current = {
                    screenIndex: currentScreenIndex,
                    optionId: option.id,
                    sealId: seal.id,
                    sealName: t(seal.shortNameKey),
                    openedAt: new Date(),
                  };
                  setActiveSeal(seal);
                }
              }}
            />
          </section>
        )}

        {step === "final-confirmation" && (
          <section className="complete-card final-confirmation-card session-three-final-confirmation">
            {participantLocation === "NMSU" && (
              <div
                className="badge"
                style={{ background: getLocationColor(participantLocation) }}
              >
                {t("s1.badge")}
              </div>
            )}
            <h2>{t("s1.confirmTitle")}</h2>
            <p>{t("s1.confirmDesc")}</p>

            <FinalRankingList
              ranking={screenRankings[currentScreenIndex] ?? []}
              locationColor={getLocationColor(participantLocation)}
              showPrice
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
              >
                {t("s1.yes")}
              </button>
            </div>
          </section>
        )}

        {step === "between-screens" && (
          <section className="complete-card between-choices-card">
            <div className="badge" style={{ background: getLocationColor(participantLocation) }}>{t("s3.round")} {screenRankings.length + 1} {t("s3.choiceOf")} 3</div>
            {participantLocation === "NMSU" && <h2>{t("s3.betweenTitle")}</h2>}
            <p>
              {participantLocation === "NMSU" ? (
                <>
                  {t("s3.betweenDesc1")} {screenRankings.length} {t("s3.betweenDesc2")}
                </>
              ) : (
                <>
                  {t("s3.betweenDesc1")} {screenRankings.length}. {t("s3.betweenDesc2")}
                </>
              )}
            </p>

            <button
              type="button"
              className="primary-button full-width-button"
              style={{ background: getLocationColor(participantLocation) }}
              onClick={handleContinueToNextScreen}
              disabled={isAdvancing}
            >
              {isAdvancing
                ? t("s3.loading")
                : t(
                    screenRankings.length === 1
                      ? "s3.goToSecondRound"
                      : "s3.goToThirdRound"
                  )}
            </button>
          </section>
        )}

        {step === "pre-demographics" && (
          <section className="complete-card pre-demographics-card">
            <div
              className="badge"
              style={{
                background: getLocationColor(participantLocation),
                color: "#ffffff",
              }}
            >
              {t("s3.preDemoBadge")}
            </div>
            <h2>{t("s3.preDemoTitle")}</h2>
            <p>
              {t("s3.preDemoDesc")}
            </p>

            <button
              type="button"
              className="primary-button full-width-button"
              style={{ background: getLocationColor(participantLocation) }}
              onClick={() => setStep("demographics")}
            >
              {t("common.continue")}
            </button>
          </section>
        )}

        {step === "demographics" && (
          <section className="complete-card">
            <DemographicsForm
              onSubmit={saveSessionThree}
              locationColor={getLocationColor(participantLocation)}
              initialData={demographicsDraft}
              onProgressChange={setDemographicsDraft}
            />
          </section>
        )}

        {step === "completed" && (
          <section className="complete-card">
            <div
              className="badge"
              style={{
                background: getLocationColor(participantLocation),
                color: "#ffffff",
              }}
            >
              {t("common.completed")}
            </div>
            <h2 style={{ marginTop: "16px" }}>{t("s3.completedTitle")}</h2>

            <div style={{ marginTop: "24px" }}>
              <Link href="/" className="primary-link-button" style={{ background: getLocationColor(participantLocation) }}>
                {t("s3.finish")}
              </Link>
            </div>
          </section>
        )}
        </StepTransition>
      </section>

      {activeSeal && (
        <SealDescriptionModal
          imageUrl={activeSeal.imageUrl}
          name={t(activeSeal.shortNameKey)}
          description={t(activeSeal.descriptionKey)}
          buttonLabel={t("s3.readBtn")}
          color={getLocationColor(participantLocation)}
          onClose={closeActiveSeal}
        />
      )}
    </main>
  );
}
