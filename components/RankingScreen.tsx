"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import RankingProductGrid from "@/components/RankingProductGrid";
import RankingSelectionCart from "@/components/RankingSelectionCart";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { getLocationColor } from "@/lib/locations";
import type {
  DecisionAttemptRecord,
  PreselectionReorderRecord,
  RankingTrackingData,
  RankingSnapshotItem,
  SealInteractionRecord,
} from "@/lib/sessionTracking";

export type ClickLogRow = {
  participant_id?: string;
  location?: string;
  session_number: number;
  session_suffix?: string;
  screen_name: string;
  event_type: string;
  element_id: string;
  element_label: string;
  option_id?: string;
  seal_id?: string;
  rank_number?: number | string;
  from_rank?: number | string;
  to_rank?: number | string;
  condition_id?: string;
  price_brl?: number | string;
  price?: number | string;
  price_currency?: string;
  price_unit?: string;
  price_increase_percent?: number | string;
  x_position: number | string;
  y_position: number | string;
  viewport_width: number | string;
  viewport_height: number | string;
  clicked_at: string;
};

export type RankingOption = {
  id: string;
  cutId?: string;
  sealId?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  cutImageUrl?: string;
  sealImageUrl?: string;
  sealColor?: string;
  price?: number;
  priceCurrency?: string;
  priceCurrencySymbol?: string;
  priceUnit?: string;
  priceUnitLabel?: string;
  priceLocale?: string;
  priceIncreasePercent?: number;
  priceLevel?: string;
  conditionId?: string;

  screenStartedAt?: string;
  optionSelectedAt?: string;
  purchaseConfirmedAt?: string;

  timeSpentBeforeChoiceMs?: number;
  timeSpentBeforeChoiceSeconds?: number;

  timeTakenToConfirmMs?: number;
  timeTakenToConfirmSeconds?: number;

  changedPreferenceBeforeConfirming?: string;
  initialSelectedOptionId?: string;
  finalConfirmedOptionId?: string;
  decisionSequence?: number;
  productSelectionTimeMs?: number;
  confirmationTimeMs?: number;
  decisionTimeMs?: number;
  confirmationAttempts?: number;
  rejectedConfirmations?: number;
  rejectedProducts?: string;
};

export type RankingProgressDraft = {
  selectedRanking: RankingOption[];
  clickLogs: ClickLogRow[];
  pendingOption: RankingOption | null;
  screenStartedAt: string;
  optionSelectedAt: string | null;
  selectionSegmentStartedAt: string;
  currentSelectionSegmentMs: number;
  accumulatedSelectionTimeMs: number;
  accumulatedConfirmationTimeMs: number;
  confirmationAttempts: number;
  rejectedConfirmations: number;
  rejectedProducts: string[];
  rankingStartedAt: string;
  decisionAttempts: DecisionAttemptRecord[];
  sealInteractions: SealInteractionRecord[];
  reviewStartedAt: string | null;
  reviewInitialRanking: RankingSnapshotItem[];
  reviewReorders: PreselectionReorderRecord[];
  initialSelectedOptionId: string;
  preferenceChanged: boolean;
};

type RankingScreenProps = {
  options: RankingOption[];
  sessionNumber: number;
  sessionSuffix?: string;
  title?: string;
  progressLabel?: string;
  description?: string;
  location?: string;
  participantId?: string;
  showSessionLabel?: boolean;
  sealZoom?: boolean;
  showPriceInCart?: boolean;
  initialRanking?: RankingOption[];
  initialClickLogs?: ClickLogRow[];
  initialTracking?: RankingTrackingData;
  initialProgress?: RankingProgressDraft;
  onProgressChange?: (progress: RankingProgressDraft) => void;
  onRankingComplete: (
    ranking: RankingOption[],
    clickLogs?: ClickLogRow[],
    tracking?: RankingTrackingData
  ) => void;
  onSealClick?: (sealId?: string) => void;
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export default function RankingScreen({
  options,
  sessionNumber,
  sessionSuffix,
  title,
  progressLabel,
  description,
  location,
  participantId,
  showSessionLabel = true,
  sealZoom,
  showPriceInCart,
  initialRanking = [],
  initialClickLogs = [],
  initialTracking,
  initialProgress,
  onProgressChange,
  onRankingComplete,
  onSealClick,
}: RankingScreenProps) {
  const { t } = useLanguage();
  const restoredRanking = initialProgress?.selectedRanking ?? initialRanking;
  const restoredClickLogs = initialProgress?.clickLogs ?? initialClickLogs;
  const restoredScreenStartedAt = initialProgress?.screenStartedAt
    ? new Date(initialProgress.screenStartedAt)
    : new Date();

  const [availableOptions, setAvailableOptions] = useState(() => {
    const selectedIds = new Set(restoredRanking.map((option) => option.id));
    return options.filter((option) => !selectedIds.has(option.id));
  });
  const [selectedRanking, setSelectedRanking] = useState<RankingOption[]>(restoredRanking);
  const [pendingOption, setPendingOption] = useState<RankingOption | null>(
    initialProgress?.pendingOption ?? null
  );
  const [clickLogs, setClickLogs] = useState<ClickLogRow[]>(restoredClickLogs);
  const [draggedCartOptionId, setDraggedCartOptionId] = useState<string | null>(null);
  const [dragDirection, setDragDirection] = useState<"up" | "down" | null>(null);
  const draggedCartOptionIdRef = useRef<string | null>(null);
  const selectedRankingRef = useRef<RankingOption[]>(restoredRanking);
  const dragStartRankRef = useRef<number | null>(null);
  const isReorderEnabled = location === "PUCPR" || location === "UFBA";
  const tracksRankingReview = isReorderEnabled;
  const isRevisionCycle = Boolean(
    tracksRankingReview &&
      initialTracking?.finalConfirmationAttempts?.at(-1)?.response === "No"
  );

  const [screenStartedAt, setScreenStartedAt] = useState(restoredScreenStartedAt);
  const [optionSelectedAt, setOptionSelectedAt] = useState<Date | null>(
    initialProgress?.optionSelectedAt
      ? new Date(initialProgress.optionSelectedAt)
      : null
  );
  const selectionSegmentStartedAtRef = useRef(
    initialProgress?.selectionSegmentStartedAt
      ? new Date(initialProgress.selectionSegmentStartedAt)
      : restoredScreenStartedAt
  );
  const currentSelectionSegmentMsRef = useRef(
    initialProgress?.currentSelectionSegmentMs ?? 0
  );
  const accumulatedSelectionTimeMsRef = useRef(
    initialProgress?.accumulatedSelectionTimeMs ?? 0
  );
  const accumulatedConfirmationTimeMsRef = useRef(
    initialProgress?.accumulatedConfirmationTimeMs ?? 0
  );
  const confirmationAttemptsRef = useRef(
    initialProgress?.confirmationAttempts ?? 0
  );
  const rejectedConfirmationsRef = useRef(
    initialProgress?.rejectedConfirmations ?? 0
  );
  const rejectedProductsRef = useRef<string[]>([
    ...(initialProgress?.rejectedProducts ?? []),
  ]);
  const rankingStartedAtRef = useRef(
    initialProgress?.rankingStartedAt ||
      initialTracking?.rankingStartedAt ||
      restoredScreenStartedAt.toISOString()
  );
  const decisionAttemptsRef = useRef<DecisionAttemptRecord[]>([
    ...(initialProgress?.decisionAttempts ?? initialTracking?.decisionAttempts ?? []),
  ]);
  const sealInteractionsRef = useRef<SealInteractionRecord[]>([
    ...(initialProgress?.sealInteractions ?? initialTracking?.sealInteractions ?? []),
  ]);
  const openSealTimesRef = useRef(new Map<string, Date>());
  const currentReviewStartedAtRef = useRef<Date | null>(
    initialProgress?.reviewStartedAt
      ? new Date(initialProgress.reviewStartedAt)
      : restoredRanking.length === options.length
        ? restoredScreenStartedAt
        : null
  );
  const currentReviewInitialRankingRef = useRef<RankingSnapshotItem[]>(
    initialProgress?.reviewInitialRanking ??
    (restoredRanking.length === options.length
      ? restoredRanking.map((option) => ({
          optionId: option.id,
          sealId: option.sealId || "",
          choiceName: option.subtitle || option.title,
        }))
      : [])
  );
  const currentReviewReordersRef = useRef<PreselectionReorderRecord[]>([
    ...(initialProgress?.reviewReorders ?? []),
  ]);

  const [initialSelectedOptionId, setInitialSelectedOptionId] = useState(
    initialProgress?.initialSelectedOptionId ?? ""
  );
  const [preferenceChanged, setPreferenceChanged] = useState(
    initialProgress?.preferenceChanged ?? false
  );
  const [progressRevision, setProgressRevision] = useState(0);
  const onProgressChangeRef = useRef(onProgressChange);

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  useEffect(() => {
    onProgressChangeRef.current?.({
      selectedRanking,
      clickLogs,
      pendingOption,
      screenStartedAt: screenStartedAt.toISOString(),
      optionSelectedAt: optionSelectedAt?.toISOString() ?? null,
      selectionSegmentStartedAt: selectionSegmentStartedAtRef.current.toISOString(),
      currentSelectionSegmentMs: currentSelectionSegmentMsRef.current,
      accumulatedSelectionTimeMs: accumulatedSelectionTimeMsRef.current,
      accumulatedConfirmationTimeMs: accumulatedConfirmationTimeMsRef.current,
      confirmationAttempts: confirmationAttemptsRef.current,
      rejectedConfirmations: rejectedConfirmationsRef.current,
      rejectedProducts: [...rejectedProductsRef.current],
      rankingStartedAt: rankingStartedAtRef.current,
      decisionAttempts: [...decisionAttemptsRef.current],
      sealInteractions: [...sealInteractionsRef.current],
      reviewStartedAt: currentReviewStartedAtRef.current?.toISOString() ?? null,
      reviewInitialRanking: [...currentReviewInitialRankingRef.current],
      reviewReorders: [...currentReviewReordersRef.current],
      initialSelectedOptionId,
      preferenceChanged,
    });
  }, [
    clickLogs,
    initialSelectedOptionId,
    optionSelectedAt,
    pendingOption,
    preferenceChanged,
    progressRevision,
    screenStartedAt,
    selectedRanking,
  ]);

  const currentRank = selectedRanking.length + 1;

  function createRankingSnapshot(ranking: RankingOption[]) {
    return ranking.map((option) => ({
      optionId: option.id,
      sealId: option.sealId || "",
      choiceName: option.subtitle || option.title,
    }));
  }

  const stepKeys: TranslationKey[] = [
    "ranking.step1",
    "ranking.step2",
    "ranking.step3",
    "ranking.step4",
    "ranking.step5",
  ];

  const ordKeys: TranslationKey[] = [
    "ranking.ord1",
    "ranking.ord2",
    "ranking.ord3",
    "ranking.ord4",
    "ranking.ord5",
    "ranking.ord6",
    "ranking.ord7",
    "ranking.ord8",
    "ranking.ord9",
    "ranking.ord10",
  ];

  function makeClickLog(
    event: MouseEvent<HTMLElement> | undefined,
    details: {
      eventType: string;
      elementId: string;
      elementLabel: string;
      option?: RankingOption | null;
      rankNumber?: number | string;
    }
  ): ClickLogRow {
    return {
      participant_id: participantId || "",
      location: location || "",
      session_number: sessionNumber,
      session_suffix: sessionSuffix || "",
      screen_name: `session-${sessionNumber}-ranking`,
      event_type: details.eventType,
      element_id: details.elementId,
      element_label: details.elementLabel,
      option_id: details.option?.id || "",
      seal_id: details.option?.sealId || "",
      rank_number: details.rankNumber ?? currentRank,
      condition_id: details.option?.conditionId || "",
      price_brl:
        details.option?.priceCurrency === "BRL"
          ? details.option?.price ?? ""
          : "",
      price: details.option?.price ?? "",
      price_currency: details.option?.priceCurrency ?? "",
      price_unit: details.option?.priceUnit ?? "",
      price_increase_percent: details.option?.priceIncreasePercent ?? "",
      x_position: event?.clientX ?? "",
      y_position: event?.clientY ?? "",
      viewport_width:
        typeof window !== "undefined" ? window.innerWidth : "",
      viewport_height:
        typeof window !== "undefined" ? window.innerHeight : "",
      clicked_at: new Date().toISOString(),
    };
  }

  function addClickLog(
    event: MouseEvent<HTMLElement> | undefined,
    details: {
      eventType: string;
      elementId: string;
      elementLabel: string;
      option?: RankingOption | null;
      rankNumber?: number | string;
    }
  ) {
    const row = makeClickLog(event, details);
    setClickLogs((current) => [...current, row]);
    return row;
  }

  function makeCartReorderLog(
    option: RankingOption,
    fromRank: number,
    toRank: number,
    clientX: number,
    clientY: number
  ): ClickLogRow {
    return {
      participant_id: participantId || "",
      location: location || "",
      session_number: sessionNumber,
      session_suffix: sessionSuffix || "",
      screen_name: `session-${sessionNumber}-ranking`,
      event_type: "selected_ranking_reorder_drag",
      element_id: option.id,
      element_label: `${option.title}${option.subtitle ? ` - ${option.subtitle}` : ""}`,
      option_id: option.id,
      seal_id: option.sealId || "",
      rank_number: toRank,
      from_rank: fromRank,
      to_rank: toRank,
      condition_id: option.conditionId || "",
      price_brl:
        option.priceCurrency === "BRL"
          ? option.price ?? ""
          : "",
      price: option.price ?? "",
      price_currency: option.priceCurrency ?? "",
      price_unit: option.priceUnit ?? "",
      price_increase_percent: option.priceIncreasePercent ?? "",
      x_position: clientX,
      y_position: clientY,
      viewport_width:
        typeof window !== "undefined" ? window.innerWidth : "",
      viewport_height:
        typeof window !== "undefined" ? window.innerHeight : "",
      clicked_at: new Date().toISOString(),
    };
  }

  function resetChoiceTracking() {
    const nextDecisionStartedAt = new Date();
    setScreenStartedAt(nextDecisionStartedAt);
    setOptionSelectedAt(null);
    setInitialSelectedOptionId("");
    setPreferenceChanged(false);
    selectionSegmentStartedAtRef.current = nextDecisionStartedAt;
    currentSelectionSegmentMsRef.current = 0;
    accumulatedSelectionTimeMsRef.current = 0;
    accumulatedConfirmationTimeMsRef.current = 0;
    confirmationAttemptsRef.current = 0;
    rejectedConfirmationsRef.current = 0;
    rejectedProductsRef.current = [];
  }

  function handleSelect(
    option: RankingOption,
    event?: MouseEvent<HTMLElement>
  ) {
    addClickLog(event, {
      eventType: "product_card_click",
      elementId: option.id,
      elementLabel: `${option.title}${option.subtitle ? ` - ${option.subtitle}` : ""}`,
      option,
      rankNumber: currentRank,
    });

    const selectedAt = new Date();
    const productSelectionSegmentMs = Math.max(
      0,
      selectedAt.getTime() - selectionSegmentStartedAtRef.current.getTime()
    );
    currentSelectionSegmentMsRef.current = productSelectionSegmentMs;
    accumulatedSelectionTimeMsRef.current += productSelectionSegmentMs;
    confirmationAttemptsRef.current += 1;

    if (!initialSelectedOptionId) {
      setInitialSelectedOptionId(option.id);
    } else if (option.id !== initialSelectedOptionId) {
      setPreferenceChanged(true);
    }

    setOptionSelectedAt(selectedAt);
    setPendingOption(option);
  }

  function handleConfirmChoice(event?: MouseEvent<HTMLButtonElement>) {
    if (!pendingOption) return;

    const confirmClick = makeClickLog(event, {
      eventType: "confirm_modal_yes_click",
      elementId: "confirm-choice-yes",
      elementLabel: "Confirm purchase intention",
      option: pendingOption,
      rankNumber: currentRank,
    });

    const confirmedAt = new Date();
    const selectedAt = optionSelectedAt ?? confirmedAt;
    const finalConfirmationTimeMs = Math.max(
      0,
      confirmedAt.getTime() - selectedAt.getTime()
    );
    accumulatedConfirmationTimeMsRef.current += finalConfirmationTimeMs;
    const decisionNumber = selectedRanking.length + 1;
    const choiceName = pendingOption.subtitle || pendingOption.title;

    decisionAttemptsRef.current.push({
      decisionNumber,
      optionId: pendingOption.id,
      sealId: pendingOption.sealId || "",
      choiceName,
      selectedAt: selectedAt.toISOString(),
      resolvedAt: confirmedAt.toISOString(),
      response: "Yes",
      productSelectionTimeMs: currentSelectionSegmentMsRef.current,
      confirmationTimeMs: finalConfirmationTimeMs,
    });

    const timeSpentBeforeChoiceMs = accumulatedSelectionTimeMsRef.current;
    const timeTakenToConfirmMs = accumulatedConfirmationTimeMsRef.current;
    const decisionTimeMs = timeSpentBeforeChoiceMs + timeTakenToConfirmMs;

    const trackedOption: RankingOption = {
      ...pendingOption,

      screenStartedAt: screenStartedAt.toISOString(),
      optionSelectedAt: selectedAt.toISOString(),
      purchaseConfirmedAt: confirmedAt.toISOString(),

      timeSpentBeforeChoiceMs,
      timeSpentBeforeChoiceSeconds: Number(
        (timeSpentBeforeChoiceMs / 1000).toFixed(3)
      ),

      timeTakenToConfirmMs,
      timeTakenToConfirmSeconds: Number(
        (timeTakenToConfirmMs / 1000).toFixed(3)
      ),

      changedPreferenceBeforeConfirming: preferenceChanged ? "Yes" : "No",
      initialSelectedOptionId: initialSelectedOptionId || pendingOption.id,
      finalConfirmedOptionId: pendingOption.id,
      decisionSequence: decisionNumber,
      productSelectionTimeMs: timeSpentBeforeChoiceMs,
      confirmationTimeMs: timeTakenToConfirmMs,
      decisionTimeMs,
      confirmationAttempts: confirmationAttemptsRef.current,
      rejectedConfirmations: rejectedConfirmationsRef.current,
      rejectedProducts: rejectedProductsRef.current.join(", "),
    };

    const nextRanking = [...selectedRanking, trackedOption];

    const nextAvailableOptions = availableOptions.filter(
      (option) => option.id !== pendingOption.id
    );

    setClickLogs((current) => [...current, confirmClick]);
    setSelectedRanking(nextRanking);
    selectedRankingRef.current = nextRanking;
    if (
      tracksRankingReview &&
      nextRanking.length === options.length
    ) {
      currentReviewStartedAtRef.current = confirmedAt;
      if (currentReviewInitialRankingRef.current.length === 0) {
        currentReviewInitialRankingRef.current =
          createRankingSnapshot(nextRanking);
      }
    }
    setAvailableOptions(nextAvailableOptions);
    setPendingOption(null);
    resetChoiceTracking();
  }

  function handleCancelChoice(event?: MouseEvent<HTMLButtonElement>) {
    if (!pendingOption) return;

    const rejectedAt = new Date();
    const selectedAt = optionSelectedAt ?? rejectedAt;
    const confirmationTimeMs = Math.max(
      0,
      rejectedAt.getTime() - selectedAt.getTime()
    );
    accumulatedConfirmationTimeMsRef.current += confirmationTimeMs;
    rejectedConfirmationsRef.current += 1;
    rejectedProductsRef.current.push(pendingOption.subtitle || pendingOption.title);
    decisionAttemptsRef.current.push({
      decisionNumber: selectedRanking.length + 1,
      optionId: pendingOption.id,
      sealId: pendingOption.sealId || "",
      choiceName: pendingOption.subtitle || pendingOption.title,
      selectedAt: selectedAt.toISOString(),
      resolvedAt: rejectedAt.toISOString(),
      response: "No",
      productSelectionTimeMs: currentSelectionSegmentMsRef.current,
      confirmationTimeMs,
    });

    addClickLog(event, {
      eventType: "confirm_modal_no_click",
      elementId: "confirm-choice-no",
      elementLabel: "Go back before confirming purchase intention",
      option: pendingOption,
      rankNumber: currentRank,
    });

    setPendingOption(null);
    setOptionSelectedAt(null);
    selectionSegmentStartedAtRef.current = rejectedAt;
    currentSelectionSegmentMsRef.current = 0;
  }

  function handleClearSelections(event?: MouseEvent<HTMLButtonElement>) {
    addClickLog(event, {
      eventType: "clear_selections_click",
      elementId: "clear-selections",
      elementLabel: "Clear selections",
      rankNumber: currentRank,
    });

    setAvailableOptions(options);
    setSelectedRanking([]);
    selectedRankingRef.current = [];
    setPendingOption(null);
    resetChoiceTracking();
  }

  function removeFromCart(
    optionId: string,
    event?: MouseEvent<HTMLButtonElement>
  ) {
    const removedOption = selectedRanking.find(
      (option) => option.id === optionId
    );

    if (!removedOption) return;

    addClickLog(event, {
      eventType: "remove_from_cart_click",
      elementId: `remove-${optionId}`,
      elementLabel: `Remove ${removedOption.title}`,
      option: removedOption,
      rankNumber:
        selectedRanking.findIndex((option) => option.id === optionId) + 1,
    });

    const remainingRanking = selectedRanking.filter(
      (option) => option.id !== optionId
    );

    const restoredOption: RankingOption = {
      ...removedOption,
      screenStartedAt: undefined,
      optionSelectedAt: undefined,
      purchaseConfirmedAt: undefined,
      timeSpentBeforeChoiceMs: undefined,
      timeSpentBeforeChoiceSeconds: undefined,
      timeTakenToConfirmMs: undefined,
      timeTakenToConfirmSeconds: undefined,
      changedPreferenceBeforeConfirming: undefined,
      initialSelectedOptionId: undefined,
      finalConfirmedOptionId: undefined,
    };

    setSelectedRanking(remainingRanking);
    selectedRankingRef.current = remainingRanking;
    setAvailableOptions((current) => [...current, restoredOption]);
    setPendingOption(null);
    resetChoiceTracking();
  }

  function reorderSelectedRankingOverTarget(
    targetId: string
  ) {
    const currentId = draggedCartOptionIdRef.current;

    if (!isReorderEnabled || !currentId || currentId === targetId) return;

    setSelectedRanking((currentRanking) => {
      const fromIndex = currentRanking.findIndex((option) => option.id === currentId);
      const toIndex = currentRanking.findIndex((option) => option.id === targetId);

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return currentRanking;
      }

      setDragDirection(toIndex > fromIndex ? "down" : "up");

      const nextRanking = moveItem(currentRanking, fromIndex, toIndex);
      selectedRankingRef.current = nextRanking;
      return nextRanking;
    });
  }

  function handleCartPointerDown(
    event: PointerEvent<HTMLLIElement>,
    optionId: string
  ) {
    if (!isReorderEnabled) return;
    if ((event.target as HTMLElement).closest("button")) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggedCartOptionIdRef.current = optionId;
    dragStartRankRef.current =
      selectedRankingRef.current.findIndex((option) => option.id === optionId) +
      1;
    setDraggedCartOptionId(optionId);
    setDragDirection(null);
  }

  function handleCartPointerMove(event: PointerEvent<HTMLLIElement>) {
    if (!isReorderEnabled || !draggedCartOptionIdRef.current) return;

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-cart-option-id]");

    const targetId = target?.dataset.cartOptionId;

    if (targetId) {
      reorderSelectedRankingOverTarget(targetId);
    }
  }

  function handleCartPointerEnd(event: PointerEvent<HTMLLIElement>) {
    if (!isReorderEnabled) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const optionId = draggedCartOptionIdRef.current;
    const fromRank = dragStartRankRef.current;
    const toRank = optionId
      ? selectedRankingRef.current.findIndex((option) => option.id === optionId) +
        1
      : 0;

    if (optionId && fromRank && toRank && fromRank !== toRank) {
      const movedOption = selectedRankingRef.current[toRank - 1];
      setClickLogs((currentLogs) => [
        ...currentLogs,
        makeCartReorderLog(
          movedOption,
          fromRank,
          toRank,
          event.clientX,
          event.clientY
        ),
      ]);

      if (
        tracksRankingReview &&
        selectedRankingRef.current.length === options.length
      ) {
        const movedAt = new Date();
        const reviewStartedAt = currentReviewStartedAtRef.current ?? movedAt;
        currentReviewReordersRef.current.push({
          optionId: movedOption.id,
          sealId: movedOption.sealId || "",
          choiceName: movedOption.subtitle || movedOption.title,
          fromRank,
          toRank,
          movedAt: movedAt.toISOString(),
          timeSincePreselectionStartedMs:
            Math.max(0, movedAt.getTime() - reviewStartedAt.getTime()),
        });
      }
    }

    draggedCartOptionIdRef.current = null;
    dragStartRankRef.current = null;
    setDraggedCartOptionId(null);
    setDragDirection(null);
  }

  function handleRankingCompleteClick(event?: MouseEvent<HTMLButtonElement>) {
    const completeClick = makeClickLog(event, {
      eventType: "ranking_complete_click",
      elementId: "ranking-complete",
      elementLabel: "Confirm full ranking",
      rankNumber: "complete",
    });

    const finalClickLogs = [...clickLogs, completeClick];
    const chronologicalRanking = [...selectedRanking].sort(
      (a, b) => (a.decisionSequence ?? 99) - (b.decisionSequence ?? 99)
    );
    const firstMomentCompletedAt =
      chronologicalRanking.at(-1)?.purchaseConfirmedAt ||
      initialTracking?.firstMomentCompletedAt ||
      "";
    const reviewCompletedAt = new Date();
    const reviewStartedAt = currentReviewStartedAtRef.current;
    const reviewTotalTimeMs = reviewStartedAt
      ? Math.max(0, reviewCompletedAt.getTime() - reviewStartedAt.getTime())
      : 0;
    const finalRankingSnapshot = createRankingSnapshot(selectedRanking);
    const tracking: RankingTrackingData = {
      ...(initialTracking ?? {}),
      rankingStartedAt: rankingStartedAtRef.current,
      rankingCompletedAt: reviewCompletedAt.toISOString(),
      firstMomentCompletedAt,
      decisionAttempts: [...decisionAttemptsRef.current],
      sealInteractions: [...sealInteractionsRef.current],
      ...(tracksRankingReview
        ? isRevisionCycle
          ? {
              rankingRevisions: [
                ...(initialTracking?.rankingRevisions ?? []),
                {
                  startedAt:
                    reviewStartedAt?.toISOString() ||
                    reviewCompletedAt.toISOString(),
                  completedAt: reviewCompletedAt.toISOString(),
                  totalTimeMs: reviewTotalTimeMs,
                  initialRanking: [
                    ...currentReviewInitialRankingRef.current,
                  ],
                  finalRanking: finalRankingSnapshot,
                  reorders: [...currentReviewReordersRef.current],
                },
              ],
            }
          : {
              preselectionStartedAt:
                reviewStartedAt?.toISOString() || firstMomentCompletedAt,
              preselectionCompletedAt: reviewCompletedAt.toISOString(),
              preselectionTotalTimeMs: reviewTotalTimeMs,
              preselectionInitialRanking: [
                ...currentReviewInitialRankingRef.current,
              ],
              preselectionFinalRanking: finalRankingSnapshot,
              preselectionReorders: [...currentReviewReordersRef.current],
            }
        : {}),
    };

    setClickLogs(finalClickLogs);
    onRankingComplete(selectedRanking, finalClickLogs, tracking);
  }

  function handleSealZoomOpen(option: RankingOption) {
    if (!openSealTimesRef.current.has(option.id)) {
      openSealTimesRef.current.set(option.id, new Date());
    }
  }

  function handleSealZoomClose(option: RankingOption) {
    const openedAt = openSealTimesRef.current.get(option.id);

    if (!openedAt) return;

    const closedAt = new Date();
    sealInteractionsRef.current.push({
      optionId: option.id,
      sealId: option.sealId || "",
      sealName: option.subtitle || option.title,
      openedAt: openedAt.toISOString(),
      closedAt: closedAt.toISOString(),
      durationMs: Math.max(0, closedAt.getTime() - openedAt.getTime()),
    });
    openSealTimesRef.current.delete(option.id);
    setProgressRevision((current) => current + 1);
  }

  return (
    <div className="ranking-area">
      {!(isReorderEnabled && selectedRanking.length === options.length) && (
      <header className="ranking-toolbar">
        <div>
          {showSessionLabel && (
            <p>
              {t("common.session")} {sessionNumber}
              {sessionSuffix ? `. ${sessionSuffix}` : ""}
            </p>
          )}

          <h2>
            {title ??
              (stepKeys[currentRank - 1]
                ? t(stepKeys[currentRank - 1])
                : `${t("ranking.stepN")} #${currentRank}`)}
          </h2>

          {progressLabel && (
            <p className="ranking-progress-label">{progressLabel}</p>
          )}

          <span>{description ?? t("ranking.instruction")}</span>
        </div>

        {!isReorderEnabled && (
          <button
            type="button"
            className="clear-selections-button"
            onClick={handleClearSelections}
          >
            {t("ranking.clear")}
          </button>
        )}
      </header>
      )}

      <div className="ranking-layout">
        <RankingProductGrid
          options={availableOptions}
          location={location}
          sealZoom={sealZoom}
          onSelect={handleSelect}
          onSealZoomOpen={handleSealZoomOpen}
          onSealZoomClose={handleSealZoomClose}
          onSealClick={(option) => {
            addClickLog(undefined, {
              eventType: "seal_image_click",
              elementId: `seal-${option.sealId || ""}`,
              elementLabel: option.subtitle || option.title,
              option,
              rankNumber: currentRank,
            });
            onSealClick?.(option.sealId);
          }}
        />

        <RankingSelectionCart
          ranking={selectedRanking}
          totalOptions={options.length}
          isReorderEnabled={isReorderEnabled}
          draggedOptionId={draggedCartOptionId}
          dragDirection={dragDirection}
          showPriceInCart={showPriceInCart}
          location={location}
          onPointerDown={handleCartPointerDown}
          onPointerMove={handleCartPointerMove}
          onPointerEnd={handleCartPointerEnd}
          onRemove={removeFromCart}
          onComplete={handleRankingCompleteClick}
        />
      </div>

      <ConfirmModal
        open={Boolean(pendingOption)}
        title={t("ranking.modalTitle")}
        message={
          pendingOption
            ? `${t("ranking.modalQ.pre")} "${pendingOption.title}${
                pendingOption.subtitle
                  ? ` - ${pendingOption.subtitle}`
                  : ""
              }" ${t("ranking.modalQ.mid")} ${
                ordKeys[currentRank - 1]
                  ? t(ordKeys[currentRank - 1])
                  : currentRank
              } ${t("ranking.modalQ.suf")}`
            : ""
        }
        confirmColor={
          getLocationColor(location ?? "")
        }
        onConfirm={handleConfirmChoice}
        onCancel={handleCancelChoice}
      />
    </div>
  );
}

