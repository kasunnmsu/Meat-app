"use client";

import { useEffect, useState } from "react";
import type { RankingOption } from "@/components/RankingScreen";
import { formatOptionPrice } from "@/lib/formatOptionPrice";

type FinalRankingListProps = {
  ranking: RankingOption[];
  locationColor: string;
  showPrice?: boolean;
};

export default function FinalRankingList({
  ranking,
  locationColor,
  showPrice = false,
}: FinalRankingListProps) {
  const [zoomedSealId, setZoomedSealId] = useState<string | null>(null);

  useEffect(() => {
    if (!zoomedSealId) return;

    function handlePointerDown(event: PointerEvent) {
      if ((event.target as HTMLElement).closest(".final-seal-zoom-btn")) {
        return;
      }

      setZoomedSealId(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [zoomedSealId]);

  return (
    <ol className="final-ranking-list">
      {ranking.map((option, index) => (
        <li key={option.id}>
          <strong style={{ background: locationColor }}>#{index + 1}</strong>
          <div className="final-ranking-images">
            {option.cutImageUrl && (
              <img
                src={option.cutImageUrl}
                alt={option.title}
                className="final-cut-img"
              />
            )}
            {option.sealImageUrl && (
              <button
                type="button"
                className="final-seal-zoom-btn"
                onClick={() =>
                  setZoomedSealId(
                    zoomedSealId === option.id ? null : option.id
                  )
                }
              >
                <img
                  src={option.sealImageUrl}
                  alt=""
                  className={
                    zoomedSealId === option.id
                      ? "final-seal-img final-seal-zoomed"
                      : "final-seal-img"
                  }
                />
              </button>
            )}
          </div>
          <div className="final-ranking-text">
            <span>{option.title}</span>
            <small>{option.subtitle}</small>
            {showPrice && typeof option.price === "number" && (
              <small className="final-ranking-price">
                {formatOptionPrice(option)}
              </small>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
