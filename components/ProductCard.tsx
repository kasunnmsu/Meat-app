"use client";

import Image from "next/image";
import { RankingOption } from "@/components/RankingScreen";

type ProductCardProps = {
  option: RankingOption;
  displayedPosition: number;
  onSelect: () => void;
  onSealClick?: () => void;
};

export default function ProductCard({
  option,
  onSelect,
  onSealClick,
}: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-image-box meat-seal-display">
        {option.cutImageUrl ? (
          <Image
            src={option.cutImageUrl}
            alt={`${option.title} meat cut`}
            width={360}
            height={260}
            className="cut-image"
          />
        ) : option.imageUrl ? (
          <Image
            src={option.imageUrl}
            alt={option.title}
            width={360}
            height={260}
            className="cut-image"
          />
        ) : (
          <span>Meat image placeholder</span>
        )}

        {option.sealImageUrl && (
          <button
            type="button"
            className="seal-click-button"
            onClick={(event) => {
              event.stopPropagation();
              if (onSealClick) onSealClick();
            }}
            aria-label={`Read description for ${option.title} seal`}
          >
            <Image
              src={option.sealImageUrl}
              alt={`${option.title} seal`}
              width={110}
              height={110}
              className="seal-overlay-image"
            />
          </button>
        )}
      </div>

      <div className="product-info">
        <h3>{option.title}</h3>

        {option.subtitle && <p>{option.subtitle}</p>}

        <div className="option-meta">
          <span>Cut: {option.cutId}</span>
          <span>Seal: {option.sealId}</span>
        </div>

        {typeof option.price === "number" && (
          <strong>
            R$ {option.price.toFixed(2).replace(".", ",")} / kg
          </strong>
        )}
      </div>

      <button type="button" onClick={onSelect} className="select-button">
        Select this option
      </button>
    </article>
  );
}
