"use client";

import { useEffect, useMemo, useState } from "react";
import RankingScreen, { RankingOption } from "@/components/RankingScreen";
import DemographicsForm, { DemographicsData } from "@/components/DemographicsForm";
import { seededShuffle } from "@/lib/randomization";
import {
  getFallbackTopSealsForLocation,
  getSealsForLocation,
} from "@/lib/locationStudyConfig";

type Step = "intro" | "ranking" | "round-confirmation" | "demographics" | "completed";

type SealDefinition = {
  sealId: string;
  sealName: string;
  sealColor: string;
  sealImageUrl: string;
  description: string;
};

type PriceLevel = {
  priceIncreasePercent: number;
  price: number;
};

const BASE_PRICE = 80;

const SESSION_1_WEIGHT = 1 / 3;
const SESSION_2_WEIGHT = 2 / 3;

const priceLevels = {
  low: {
    priceIncreasePercent: 5,
    price: BASE_PRICE * 1.05,
  },
  medium: {
    priceIncreasePercent: 10,
    price: BASE_PRICE * 1.1,
  },
  high: {
    priceIncreasePercent: 20,
    price: BASE_PRICE * 1.2,
  },
};

const priceRotations: PriceLevel[][] = [
  [priceLevels.high, priceLevels.medium, priceLevels.low],
  [priceLevels.low, priceLevels.high, priceLevels.medium],
  [priceLevels.medium, priceLevels.low, priceLevels.high],
];

function getPreviousRankings() {
  const sessionOneRaw = localStorage.getItem("session-1-ranking");
  const sessionTwoRaw = localStorage.getItem("session-2-ranking");

  const sessionOneRows = sessionOneRaw ? JSON.parse(sessionOneRaw) : [];
  const sessionTwoRows = sessionTwoRaw ? JSON.parse(sessionTwoRaw) : [];

  return {
    sessionOneRows: Array.isArray(sessionOneRows) ? sessionOneRows : [],
    sessionTwoRows: Array.isArray(sessionTwoRows) ? sessionTwoRows : [],
  };
}

function getTopThreeSealsFromPreviousChoices(location: string) {
  const fallbackTopSeals = getFallbackTopSealsForLocation(location);

  try {
    const { sessionOneRows, sessionTwoRows } = getPreviousRankings();

    if (sessionOneRows.length === 0 && sessionTwoRows.length === 0) {
      return fallbackTopSeals;
    }

    const validSealIds = new Set(getSealsForLocation(location).map((seal) => seal.id));
    const scores = new Map<string, number>();

    function addWeightedScores(rows: any[], sessionWeight: number) {
      for (const row of rows) {
        const sealId = row.seal_id;

        if (!sealId) continue;
        if (!validSealIds.has(sealId)) continue;

        const selectedRank = Number(row.selected_rank || 99);

        const baseScore = Math.max(0, 6 - selectedRank);
        const weightedScore = baseScore * sessionWeight;

        scores.set(sealId, (scores.get(sealId) || 0) + weightedScore);
      }
    }

    addWeightedScores(sessionOneRows, SESSION_1_WEIGHT);
    addWeightedScores(sessionTwoRows, SESSION_2_WEIGHT);

    const topSealIds = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([sealId]) => sealId)
      .slice(0, 3);

    if (topSealIds.length >= 3) {
      return topSealIds;
    }

    const missingFallbacks = fallbackTopSeals.filter(
      (sealId) => !topSealIds.includes(sealId)
    );

    return [...topSealIds, ...missingFallbacks].slice(0, 3);
  } catch {
    return fallbackTopSeals;
  }
}

function formatBrazilianCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function SessionThreePage() {
  const [participantId, setParticipantId] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [step, setStep] = useState<Step>("intro");

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentRoundRanking, setCurrentRoundRanking] = useState<RankingOption[]>([]);
  const [allRoundRankings, setAllRoundRankings] = useState<RankingOption[][]>([]);

  const [activeSeal, setActiveSeal] = useState<SealDefinition | null>(null);
  const [topThreeSealIds, setTopThreeSealIds] = useState<string[]>([]);

  const fallbackTopSeals = useMemo(() => {
    return getFallbackTopSealsForLocation(participantLocation || "PUCPR");
  }, [participantLocation]);

  const sealDefinitions = useMemo(() => {
    return getSealsForLocation(participantLocation || "PUCPR").map((seal) => ({
      sealId: seal.id,
      sealName: seal.name,
      sealColor: seal.color,
      sealImageUrl: seal.imageUrl,
      description: seal.description,
    }));
  }, [participantLocation]);

  useEffect(() => {
    async function loadParticipantAndTopSeals() {
      const id = localStorage.getItem("participantId") || "DEMO-PARTICIPANT";
      const location = localStorage.getItem("participantLocation") || "PUCPR";

      setParticipantId(id);
      setParticipantLocation(location);

      const locationFallbackTopSeals = getFallbackTopSealsForLocation(location);

      try {
        const response = await fetch(
          `/api/session-3/top-seals?participantId=${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          setTopThreeSealIds(getTopThreeSealsFromPreviousChoices(location));
          return;
        }

        const data = await response.json();
        const validSealIds = new Set(getSealsForLocation(location).map((seal) => seal.id));

        if (Array.isArray(data.topSealIds) && data.topSealIds.length >= 3) {
          const filteredTopSealIds = data.topSealIds
            .filter((sealId: string) => validSealIds.has(sealId))
            .slice(0, 3);

          if (filteredTopSealIds.length >= 3) {
            setTopThreeSealIds(filteredTopSealIds);
            return;
          }
        }

        setTopThreeSealIds(getTopThreeSealsFromPreviousChoices(location));
      } catch {
        setTopThreeSealIds(locationFallbackTopSeals);
      }
    }

    loadParticipantAndTopSeals();
  }, []);

  const randomizationSeed = useMemo(() => {
    return participantId ? `${participantId}-session-3` : "demo-session-3";
  }, [participantId]);

  const sessionThreeOptions = useMemo(() => {
    const selectedSeals = topThreeSealIds
      .map((sealId) => sealDefinitions.find((seal) => seal.sealId === sealId))
      .filter(Boolean) as SealDefinition[];

    const currentPriceRotation = priceRotations[currentRoundIndex] || priceRotations[0];

    const pricedOptions: RankingOption[] = selectedSeals.map((seal, index) => {
      const priceLevel = currentPriceRotation[index] || priceLevels.low;

      return {
        id: `session-3-round-${currentRoundIndex + 1}-${seal.sealId}-${priceLevel.priceIncreasePercent}`,
        cutId: `price-cut-${index + 1}`,
        sealId: seal.sealId,
        title: `${seal.sealName} - ${formatBrazilianCurrency(priceLevel.price)}/kg`,
        subtitle: `Round ${currentRoundIndex + 1} of 3 | Base price ${formatBrazilianCurrency(
          BASE_PRICE
        )}/kg + ${priceLevel.priceIncreasePercent}%`,
        cutImageUrl: `/images/cuts/${
          participantLocation === "UFBA" ? "ufba" : "pucpr"
        }/${index + 1}.png`,
        sealImageUrl: seal.sealImageUrl,
        sealColor: seal.sealColor,
        price: priceLevel.price,
        priceIncreasePercent: priceLevel.priceIncreasePercent,
      };
    });

    return seededShuffle(
      pricedOptions,
      `${randomizationSeed}-round-${currentRoundIndex + 1}`
    );
  }, [
    topThreeSealIds,
    sealDefinitions,
    randomizationSeed,
    currentRoundIndex,
    participantLocation,
  ]);

  function getSealById(sealId?: string) {
    return sealDefinitions.find((seal) => seal.sealId === sealId) || null;
  }

  function handleRankingComplete(ranking: RankingOption[]) {
    setCurrentRoundRanking(ranking);
    setStep("round-confirmation");
  }

  function handleRoundConfirmationYes() {
    const updatedAllRoundRankings = [...allRoundRankings, currentRoundRanking];

    setAllRoundRankings(updatedAllRoundRankings);
    setCurrentRoundRanking([]);

    if (currentRoundIndex < 2) {
      setCurrentRoundIndex(currentRoundIndex + 1);
      setStep("ranking");
    } else {
      setStep("demographics");
    }
  }

  function handleRoundConfirmationNo() {
    setCurrentRoundRanking([]);
    setStep("ranking");
  }

  async function saveSessionThree(demographics: DemographicsData) {
    const timestamp = new Date().toISOString();

    function getRoundOption(roundIndex: number, rankIndex: number) {
      return allRoundRankings[roundIndex]?.[rankIndex];
    }

    const longRows = allRoundRankings.flatMap((roundRanking, roundIndex) =>
      roundRanking.map((option, rankIndex) => ({
        participant_id: participantId,
        location: participantLocation,
        session_number: 3,
        session_3_round: roundIndex + 1,
        method: "3 seals x 3 rotating prices price experiment",
        base_price_brl: BASE_PRICE,
        session_1_weight: SESSION_1_WEIGHT,
        session_2_weight: SESSION_2_WEIGHT,
        randomization_seed: randomizationSeed,
        round_randomization_seed: `${randomizationSeed}-round-${roundIndex + 1}`,
        selected_rank: rankIndex + 1,
        option_id: option.id,
        cut_id: option.cutId || "",
        seal_id: option.sealId || "",
        title: option.title,
        subtitle: option.subtitle || "",
        cut_image_url: option.cutImageUrl || "",
        seal_image_url: option.sealImageUrl || "",
        seal_color: option.sealColor || "",
        price_brl: option.price || "",
        price_increase_percent: option.priceIncreasePercent || "",
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
        top_three_seals_used: topThreeSealIds.join(", "),
        gender: demographics.gender,
        age_group: demographics.ageGroup,
        education_level: demographics.educationLevel,
        income_group: demographics.incomeGroup,
        timestamp,
      }))
    );

    const participantRow = {
      participant_id: participantId,
      location: participantLocation,
      session_number: 3,
      method: "3 seals x 3 rotating prices price experiment",
      base_price_brl: BASE_PRICE,
      session_1_weight: SESSION_1_WEIGHT,
      session_2_weight: SESSION_2_WEIGHT,
      randomization_seed: randomizationSeed,

      top_seal_1: topThreeSealIds[0] || "",
      top_seal_2: topThreeSealIds[1] || "",
      top_seal_3: topThreeSealIds[2] || "",

      gender: demographics.gender,
      age_group: demographics.ageGroup,
      education_level: demographics.educationLevel,
      income_group: demographics.incomeGroup,

      round_1_rank_1_option_id: getRoundOption(0, 0)?.id || "",
      round_1_rank_1_cut_id: getRoundOption(0, 0)?.cutId || "",
      round_1_rank_1_seal_id: getRoundOption(0, 0)?.sealId || "",
      round_1_rank_1_title: getRoundOption(0, 0)?.title || "",
      round_1_rank_1_price_brl: getRoundOption(0, 0)?.price || "",
      round_1_rank_1_price_increase_percent:
        getRoundOption(0, 0)?.priceIncreasePercent || "",

      round_1_rank_2_option_id: getRoundOption(0, 1)?.id || "",
      round_1_rank_2_cut_id: getRoundOption(0, 1)?.cutId || "",
      round_1_rank_2_seal_id: getRoundOption(0, 1)?.sealId || "",
      round_1_rank_2_title: getRoundOption(0, 1)?.title || "",
      round_1_rank_2_price_brl: getRoundOption(0, 1)?.price || "",
      round_1_rank_2_price_increase_percent:
        getRoundOption(0, 1)?.priceIncreasePercent || "",

      round_1_rank_3_option_id: getRoundOption(0, 2)?.id || "",
      round_1_rank_3_cut_id: getRoundOption(0, 2)?.cutId || "",
      round_1_rank_3_seal_id: getRoundOption(0, 2)?.sealId || "",
      round_1_rank_3_title: getRoundOption(0, 2)?.title || "",
      round_1_rank_3_price_brl: getRoundOption(0, 2)?.price || "",
      round_1_rank_3_price_increase_percent:
        getRoundOption(0, 2)?.priceIncreasePercent || "",

      round_2_rank_1_option_id: getRoundOption(1, 0)?.id || "",
      round_2_rank_1_cut_id: getRoundOption(1, 0)?.cutId || "",
      round_2_rank_1_seal_id: getRoundOption(1, 0)?.sealId || "",
      round_2_rank_1_title: getRoundOption(1, 0)?.title || "",
      round_2_rank_1_price_brl: getRoundOption(1, 0)?.price || "",
      round_2_rank_1_price_increase_percent:
        getRoundOption(1, 0)?.priceIncreasePercent || "",

      round_2_rank_2_option_id: getRoundOption(1, 1)?.id || "",
      round_2_rank_2_cut_id: getRoundOption(1, 1)?.cutId || "",
      round_2_rank_2_seal_id: getRoundOption(1, 1)?.sealId || "",
      round_2_rank_2_title: getRoundOption(1, 1)?.title || "",
      round_2_rank_2_price_brl: getRoundOption(1, 1)?.price || "",
      round_2_rank_2_price_increase_percent:
        getRoundOption(1, 1)?.priceIncreasePercent || "",

      round_2_rank_3_option_id: getRoundOption(1, 2)?.id || "",
      round_2_rank_3_cut_id: getRoundOption(1, 2)?.cutId || "",
      round_2_rank_3_seal_id: getRoundOption(1, 2)?.sealId || "",
      round_2_rank_3_title: getRoundOption(1, 2)?.title || "",
      round_2_rank_3_price_brl: getRoundOption(1, 2)?.price || "",
      round_2_rank_3_price_increase_percent:
        getRoundOption(1, 2)?.priceIncreasePercent || "",

      round_3_rank_1_option_id: getRoundOption(2, 0)?.id || "",
      round_3_rank_1_cut_id: getRoundOption(2, 0)?.cutId || "",
      round_3_rank_1_seal_id: getRoundOption(2, 0)?.sealId || "",
      round_3_rank_1_title: getRoundOption(2, 0)?.title || "",
      round_3_rank_1_price_brl: getRoundOption(2, 0)?.price || "",
      round_3_rank_1_price_increase_percent:
        getRoundOption(2, 0)?.priceIncreasePercent || "",

      round_3_rank_2_option_id: getRoundOption(2, 1)?.id || "",
      round_3_rank_2_cut_id: getRoundOption(2, 1)?.cutId || "",
      round_3_rank_2_seal_id: getRoundOption(2, 1)?.sealId || "",
      round_3_rank_2_title: getRoundOption(2, 1)?.title || "",
      round_3_rank_2_price_brl: getRoundOption(2, 1)?.price || "",
      round_3_rank_2_price_increase_percent:
        getRoundOption(2, 1)?.priceIncreasePercent || "",

      round_3_rank_3_option_id: getRoundOption(2, 2)?.id || "",
      round_3_rank_3_cut_id: getRoundOption(2, 2)?.cutId || "",
      round_3_rank_3_seal_id: getRoundOption(2, 2)?.sealId || "",
      round_3_rank_3_title: getRoundOption(2, 2)?.title || "",
      round_3_rank_3_price_brl: getRoundOption(2, 2)?.price || "",
      round_3_rank_3_price_increase_percent:
        getRoundOption(2, 2)?.priceIncreasePercent || "",

      timestamp,
    };

    const response = await fetch("/api/session-3/save", {
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
      console.error("Session 3 save failed:", errorData);
      alert("Could not save Session 3 questionnaire. Please try again.");
      return;
    }

    localStorage.setItem("session-3-ranking", JSON.stringify(longRows));
    localStorage.setItem("session-3-demographics", JSON.stringify(demographics));

    const fullSurveyResponse = await fetch("/api/full-survey/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantId,
        location: participantLocation,
        demographics,
      }),
    });

    if (!fullSurveyResponse.ok) {
      const errorData = await fullSurveyResponse.json().catch(() => null);
      console.error("Full survey save failed:", errorData);
      alert(
        "Session 3 was saved, but the combined full-survey file could not be created."
      );
      return;
    }

    setStep("completed");
  }

  return (
    <main className="study-page">
      <section className="study-shell">
        <a href="/" className="back-link">
          ← Back to sessions
        </a>

        <header className="study-header">
          <div className="badge">Session 3</div>
          <h1>Price Experiment</h1>

          <p>
            This session presents the participant’s three highest-scoring seals from
            Session 1 and Session 2. Session 1 has weight 1/3 and Session 2 has
            weight 2/3. The same three seals are shown across three price rounds,
            and the price levels rotate in each round.
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

        {step === "intro" && (
          <section className="complete-card">
            <div className="badge">Individualized design</div>
            <h2>Top three seals selected for this participant</h2>

            <p>
              The app searches the saved Session 1 and Session 2 records for this
              participant ID, then selects the three highest-scoring seals using a
              weighted sum. Session 1 counts as 1/3 and Session 2 counts as 2/3.
            </p>

            <div className="price-summary-grid">
              {(topThreeSealIds.length > 0 ? topThreeSealIds : fallbackTopSeals).map(
                (sealId, index) => {
                  const seal = getSealById(sealId);
                  const priceLevel = priceRotations[0][index];

                  if (!seal || !priceLevel) return null;

                  return (
                    <article key={seal.sealId} className="price-summary-card">
                      <img src={seal.sealImageUrl} alt={seal.sealName} />
                      <h3>{seal.sealName}</h3>
                      <p>Round 1: {priceLevel.priceIncreasePercent}% increase</p>
                      <strong>{formatBrazilianCurrency(priceLevel.price)}/kg</strong>
                    </article>
                  );
                }
              )}
            </div>

            <button
              type="button"
              className="primary-button full-width-button"
              onClick={() => {
                setCurrentRoundIndex(0);
                setCurrentRoundRanking([]);
                setAllRoundRankings([]);

                if (topThreeSealIds.length === 0) {
                  setTopThreeSealIds(fallbackTopSeals);
                }

                setStep("ranking");
              }}
            >
              Start price ranking
            </button>
          </section>
        )}

        {step === "ranking" && (
          <section className="session-two-ranking-note">
            <div className="description-reminder">
              <strong>Round {currentRoundIndex + 1} of 3:</strong> Participants
              may click the seal image to view its description again. The same
              three top seals are shown in each round, but the price levels rotate
              across rounds.
            </div>

            <RankingScreen
              options={sessionThreeOptions}
              sessionNumber={3}
              onRankingComplete={handleRankingComplete}
              onSealClick={(sealId) => {
                const seal = getSealById(sealId);
                if (seal) setActiveSeal(seal);
              }}
            />
          </section>
        )}

        {step === "round-confirmation" && (
          <section className="complete-card">
            <div className="badge">Round {currentRoundIndex + 1} of 3 confirmation</div>
            <h2>Confirm your price ranking</h2>
            <p>
              Please review your order of preference for Round{" "}
              {currentRoundIndex + 1}.
            </p>

            <ol className="final-ranking-list">
              {currentRoundRanking.map((option, index) => (
                <li key={option.id}>
                  <strong>#{index + 1}</strong>
                  <span>{option.title}</span>
                  <small>
                    Cut: {option.cutId} | Seal: {option.sealId} | Price:{" "}
                    {typeof option.price === "number"
                      ? `${formatBrazilianCurrency(option.price)}/kg`
                      : ""}
                  </small>
                </li>
              ))}
            </ol>

            <div className="final-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleRoundConfirmationNo}
              >
                No, redo this round
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleRoundConfirmationYes}
              >
                {currentRoundIndex < 2
                  ? "Yes, continue to next price round"
                  : "Yes, continue to questionnaire"}
              </button>
            </div>
          </section>
        )}

        {step === "demographics" && (
          <section className="complete-card">
            <DemographicsForm onSubmit={saveSessionThree} />
          </section>
        )}

        {step === "completed" && (
          <section className="complete-card">
            <div className="badge">Completed</div>
            <h2>Survey Complete</h2>
            <p>
              Session 3 has been saved. All three price rounds were saved under
              the same participant ID. The combined full-survey Excel file has
              also been updated.
            </p>

            <a href="/" className="primary-link-button">
              Finish and Return to Home
            </a>
          </section>
        )}
      </section>

      {activeSeal && (
        <div className="modal-backdrop">
          <section className="modal-card seal-modal-card">
            <img src={activeSeal.sealImageUrl} alt={activeSeal.sealName} />

            <h2>{activeSeal.sealName}</h2>
            <p>{activeSeal.description}</p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setActiveSeal(null)}
            >
              I have read this description
            </button>
          </section>
        </div>
      )}
    </main>
  );
}