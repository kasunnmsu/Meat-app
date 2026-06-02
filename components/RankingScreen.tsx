"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import ConfirmModal from "@/components/ConfirmModal";

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
  priceIncreasePercent?: number;
  priceLevel?: string;
};

type RankingScreenProps = {
  options: RankingOption[];
  sessionNumber: number;
  onRankingComplete: (ranking: RankingOption[]) => void;
  onSealClick?: (sealId?: string) => void;
};

export default function RankingScreen({
  options,
  sessionNumber,
  onRankingComplete,
  onSealClick,
}: RankingScreenProps) {
  const [availableOptions, setAvailableOptions] = useState(options);
  const [selectedRanking, setSelectedRanking] = useState<RankingOption[]>([]);
  const [pendingOption, setPendingOption] = useState<RankingOption | null>(null);

  const currentRank = selectedRanking.length + 1;

  function handleSelect(option: RankingOption) {
    setPendingOption(option);
  }

  function handleConfirmChoice() {
    if (!pendingOption) return;

    const nextRanking = [...selectedRanking, pendingOption];

    const nextAvailableOptions = availableOptions.filter(
      (option) => option.id !== pendingOption.id
    );

    setSelectedRanking(nextRanking);
    setAvailableOptions(nextAvailableOptions);
    setPendingOption(null);

    if (nextRanking.length === options.length) {
      onRankingComplete(nextRanking);
    }
  }

  function handleCancelChoice() {
    setPendingOption(null);
  }

  function handleClearSelections() {
    setAvailableOptions(options);
    setSelectedRanking([]);
    setPendingOption(null);
  }

  function removeFromCart(optionId: string) {
    const removedOption = selectedRanking.find((option) => option.id === optionId);

    if (!removedOption) return;

    const remainingRanking = selectedRanking.filter(
      (option) => option.id !== optionId
    );

    setSelectedRanking(remainingRanking);
    setAvailableOptions([...availableOptions, removedOption]);
  }

  return (
    <div className="ranking-area">
      <header className="ranking-toolbar">
        <div>
          <p>Session {sessionNumber}</p>
          <h2>Choose rank #{currentRank}</h2>
          <span>
            Select the beef option you would buy next. Confirmed choices disappear from the screen.
          </span>
        </div>

        <button type="button" onClick={handleClearSelections}>
          Clear selections
        </button>
      </header>

      <div className="ranking-layout">
        <section className="product-grid">
          {availableOptions.map((option, index) => (
            <ProductCard
              key={option.id}
              option={option}
              displayedPosition={index + 1}
              onSelect={() => handleSelect(option)}
              onSealClick={onSealClick ? () => onSealClick(option.sealId) : undefined}
            />
          ))}
        </section>

        <aside className="selection-cart">
          <div className="cart-header">
            <div>
              <p>Preference order</p>
              <h3>Selected choices</h3>
            </div>

            <span>
              {selectedRanking.length}/{options.length}
            </span>
          </div>

          {selectedRanking.length === 0 ? (
            <div className="empty-cart">
              <strong>No choices yet</strong>
              <p>
                The participant’s ranking will appear here after each confirmed selection.
              </p>
            </div>
          ) : (
            <ol className="cart-list">
              {selectedRanking.map((option, index) => (
                <li key={option.id} className="cart-item">
                  <div className="cart-rank">#{index + 1}</div>

                  <div className="cart-item-info">
                    <strong>{option.title}</strong>
                    <span>
                      Cut: {option.cutId} | Seal: {option.sealId}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(option.id)}
                    aria-label={`Remove ${option.title}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>

      <ConfirmModal
        open={Boolean(pendingOption)}
        title="Confirm purchase intention"
        message={
          pendingOption
            ? `Do you confirm that you would buy "${pendingOption.title}" as choice #${currentRank}?`
            : ""
        }
        onConfirm={handleConfirmChoice}
        onCancel={handleCancelChoice}
      />
    </div>
  );
}
