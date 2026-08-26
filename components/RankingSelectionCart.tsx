"use client";

import type { MouseEvent, PointerEvent } from "react";
import { motion } from "framer-motion";
import type { RankingOption } from "@/components/RankingScreen";
import { formatOptionPrice } from "@/lib/formatOptionPrice";
import { useLanguage } from "@/lib/i18n";
import { getLocationColor } from "@/lib/locations";

type RankingSelectionCartProps = {
  ranking: RankingOption[];
  totalOptions: number;
  isReorderEnabled: boolean;
  draggedOptionId: string | null;
  dragDirection: "up" | "down" | null;
  showPriceInCart?: boolean;
  location?: string;
  onPointerDown: (
    event: PointerEvent<HTMLLIElement>,
    optionId: string
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLLIElement>) => void;
  onPointerEnd: (event: PointerEvent<HTMLLIElement>) => void;
  onRemove: (optionId: string, event?: MouseEvent<HTMLButtonElement>) => void;
  onComplete: (event?: MouseEvent<HTMLButtonElement>) => void;
};

export default function RankingSelectionCart({
  ranking,
  totalOptions,
  isReorderEnabled,
  draggedOptionId,
  dragDirection,
  showPriceInCart,
  location,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
  onRemove,
  onComplete,
}: RankingSelectionCartProps) {
  const { t } = useLanguage();

  return (
    <aside
      className={`selection-cart${
        ranking.length === totalOptions ? " selection-cart--complete" : ""
      }${showPriceInCart ? " selection-cart--with-price" : ""}`}
    >
      <div className="cart-header">
        <div>
          {t("ranking.cartTitle") && <p>{t("ranking.cartTitle")}</p>}
          <h3>{t("ranking.cartSubtitle")}</h3>
        </div>

        {!isReorderEnabled && (
          <span>
            {ranking.length}/{totalOptions}
          </span>
        )}
      </div>

      {ranking.length === 0 ? (
        <div className="empty-cart">
          <strong>{t("ranking.cartEmpty")}</strong>
          <p>{t("ranking.cartEmptyDesc")}</p>
        </div>
      ) : (
        <>
          {isReorderEnabled && (
            <p className="cart-reorder-instruction">
              {t("final.dragInstruction")}
            </p>
          )}
          <ol
            className={
              isReorderEnabled
                ? "cart-list cart-list--reorderable"
                : "cart-list"
            }
          >
            {ranking.map((option, index) => {
              const isDragging =
                isReorderEnabled && draggedOptionId === option.id;

              return (
                <motion.li
                  key={option.id}
                  layout
                  transition={{
                    layout: {
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                      mass: 0.8,
                    },
                  }}
                  animate={
                    isDragging ? { scale: 1.025, y: -4 } : { scale: 1, y: 0 }
                  }
                  data-cart-option-id={option.id}
                  className={
                    isDragging
                      ? "cart-item cart-item--draggable cart-item--dragging"
                      : isReorderEnabled
                        ? "cart-item cart-item--draggable"
                        : "cart-item"
                  }
                  onPointerDown={(event) => onPointerDown(event, option.id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerEnd}
                  onPointerCancel={onPointerEnd}
                >
                  <div className="cart-rank">
                    <span>#{index + 1}</span>
                    {isDragging && dragDirection && (
                      <span
                        className={`cart-rank-arrow cart-rank-arrow--${dragDirection}`}
                        aria-hidden="true"
                      >
                        {dragDirection === "up" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <strong>{option.title}</strong>
                    <span>{option.subtitle}</span>

                    {showPriceInCart && typeof option.price === "number" && (
                      <span className="cart-item-price">
                        {formatOptionPrice(option)}
                      </span>
                    )}
                  </div>

                  {!isReorderEnabled && (
                    <button
                      type="button"
                      onClick={(event) => onRemove(option.id, event)}
                      aria-label={`${t("ranking.removeAria")} ${option.title}`}
                    >
                      x
                    </button>
                  )}
                </motion.li>
              );
            })}
          </ol>
        </>
      )}

      {ranking.length === totalOptions && (
        <button
          type="button"
          className="cart-complete-button"
          style={{ background: getLocationColor(location ?? "") }}
          onClick={onComplete}
        >
          {t("ranking.confirm")}
        </button>
      )}
    </aside>
  );
}
