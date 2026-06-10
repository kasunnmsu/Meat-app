"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage, TranslationKey } from "@/lib/i18n";

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
  sessionSuffix?: string;
  title?: string;
  description?: string;
  location?: string;
  sealZoom?: boolean;
  showPriceInCart?: boolean;
  clickedSealIds?: Set<string>;
  onRankingComplete: (ranking: RankingOption[]) => void;
  onSealClick?: (sealId?: string) => void;
};

const locationColors: Record<string, string> = {
  PUCPR: "#bb0b0b",
  UFBA: "#1a7a3a",
  NMSU: "#bb0b0b",
};

export default function RankingScreen({
  options,
  sessionNumber,
  sessionSuffix,
  title,
  description,
  location,
  sealZoom,
  showPriceInCart,
  clickedSealIds,
  onRankingComplete,
  onSealClick,
}: RankingScreenProps) {
  const { t } = useLanguage();
  const [availableOptions, setAvailableOptions] = useState(options);
  const [selectedRanking, setSelectedRanking] = useState<RankingOption[]>([]);
  const [pendingOption, setPendingOption] = useState<RankingOption | null>(null);

  const currentRank = selectedRanking.length + 1;

  const stepKeys: TranslationKey[] = ["ranking.step1", "ranking.step2", "ranking.step3", "ranking.step4", "ranking.step5"];
  const ordKeys: TranslationKey[] = ["ranking.ord1", "ranking.ord2", "ranking.ord3", "ranking.ord4", "ranking.ord5", "ranking.ord6", "ranking.ord7", "ranking.ord8", "ranking.ord9", "ranking.ord10"];

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
          <p>{t("common.session")} {sessionNumber}{sessionSuffix ? ` · ${sessionSuffix}` : ""}</p>
          <h2>{title ?? (stepKeys[currentRank - 1] ? t(stepKeys[currentRank - 1]) : `${t("ranking.stepN")} #${currentRank}`)}</h2>
          <span>
            {description ?? t("ranking.instruction")}
          </span>
        </div>

        <button type="button" onClick={handleClearSelections}>
          {t("ranking.clear")}
        </button>
      </header>

      <div className="ranking-layout">
        <section className="product-grid">
          <AnimatePresence mode="popLayout">
            {availableOptions.map((option, index) => (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <ProductCard
                  option={option}
                  displayedPosition={index + 1}
                  location={location}
                  sealZoom={sealZoom}
                  onSelect={() => handleSelect(option)}
                  onSealClick={onSealClick ? () => onSealClick(option.sealId) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        <aside className={`selection-cart${selectedRanking.length === options.length ? " selection-cart--complete" : ""}`}>
          <div className="cart-header">
            <div>
              <p>{t("ranking.cartTitle")}</p>
              <h3>{t("ranking.cartSubtitle")}</h3>
            </div>

            <span>
              {selectedRanking.length}/{options.length}
            </span>
          </div>

          {selectedRanking.length === 0 ? (
            <div className="empty-cart">
              <strong>{t("ranking.cartEmpty")}</strong>
              <p>
                {t("ranking.cartEmptyDesc")}
              </p>
            </div>
          ) : (
            <ol className="cart-list">
              {selectedRanking.map((option, index) => (
                <li key={option.id} className="cart-item">
                  <div className="cart-rank">#{index + 1}</div>

                  <div className="cart-item-info">
                    <strong>{option.title}</strong>
                    <span>{option.subtitle}</span>
                    {showPriceInCart && typeof option.price === "number" && (
                      <span className="cart-item-price">{t("ranking.currency")} {option.price.toFixed(2).replace(".", ",")} {t("ranking.perKg")}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(option.id)}
                    aria-label={`${t("ranking.removeAria")} ${option.title}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          )}

          {selectedRanking.length === options.length && (
            <button
              type="button"
              className="cart-complete-button"
              style={{ background: locationColors[location ?? ""] ?? "#bb0b0b" }}
              onClick={() => onRankingComplete(selectedRanking)}
            >
              {t("ranking.confirm")}
            </button>
          )}
        </aside>
      </div>

      <ConfirmModal
        open={Boolean(pendingOption)}
        title={t("ranking.modalTitle")}
        message={
          pendingOption
            ? `${t("ranking.modalQ.pre")} "${pendingOption.title}${pendingOption.subtitle ? ` - ${pendingOption.subtitle}` : ""}" ${t("ranking.modalQ.mid")} ${ordKeys[currentRank - 1] ? t(ordKeys[currentRank - 1]) : `${currentRank}`} ${t("ranking.modalQ.suf")}`
            : ""
        }
        confirmColor={locationColors[location ?? ""] ?? "#bb0b0b"}
        onConfirm={handleConfirmChoice}
        onCancel={handleCancelChoice}
      />
    </div>
  );
}
