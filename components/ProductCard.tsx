"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RankingOption } from "@/components/RankingScreen";
import { useLanguage } from "@/lib/i18n";
import { getLocationColor } from "@/lib/locations";
import { formatOptionPrice } from "@/lib/formatOptionPrice";

type ProductCardProps = {
  option: RankingOption;
  displayedPosition: number;
  location?: string;
  sealZoom?: boolean;
  onSelect: () => void;
  onSealClick?: () => void;
  onSealZoomOpen?: () => void;
  onSealZoomClose?: () => void;
};

export default function ProductCard({
  option,
  location,
  sealZoom,
  onSelect,
  onSealClick,
  onSealZoomOpen,
  onSealZoomClose,
}: ProductCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const sealButtonRef = useRef<HTMLButtonElement | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!isZoomed) return;

    function handlePointerDown(event: PointerEvent) {
      if (sealButtonRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsZoomed(false);
      onSealZoomClose?.();
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isZoomed, onSealZoomClose]);

  return (
    <article className={`product-card${location ? ` product-card--${location.toLowerCase()}` : ""}`}>
      <div className="product-image-box meat-seal-display">
        {option.cutImageUrl ? (
          <Image
            src={option.cutImageUrl}
            alt={`Corte de carne ${option.title}`}
            width={520}
            height={380}
            className={location === "UFBA" ? "cut-image cut-image--ufba" : "cut-image"}
          />
        ) : option.imageUrl ? (
          <Image
            src={option.imageUrl}
            alt={option.title}
            width={520}
            height={380}
            className={location === "UFBA" ? "cut-image cut-image--ufba" : "cut-image"}
          />
        ) : (
          <span>Imagem da carne</span>
        )}

        {option.sealImageUrl && (
          <button
            type="button"
            ref={sealButtonRef}
            className={sealZoom ? "seal-click-button seal-zoom-trigger" : "seal-click-button"}
            onClick={(event) => {
              event.stopPropagation();
              if (sealZoom) {
                if (isZoomed) {
                  setIsZoomed(false);
                  onSealZoomClose?.();
                } else {
                  onSealClick?.();
                  setIsZoomed(true);
                  onSealZoomOpen?.();
                }
                return;
              }
              onSealClick?.();
            }}
            aria-label={`Ler descrição do selo ${option.title}`}
          >
            <Image
              src={option.sealImageUrl}
              alt={`Selo ${option.title}`}
              width={250}
              height={250}
              className={isZoomed ? "seal-overlay-image seal-zoomed" : "seal-overlay-image"}
            />
          </button>
        )}
      </div>

      <div className="product-info">
        <h3>{option.title}</h3>
        {option.subtitle && <p className="product-subtitle">{option.subtitle}</p>}

{typeof option.price === "number" && (
          <strong>
            {formatOptionPrice(option)}
          </strong>
        )}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="select-button"
        style={{ background: location ? getLocationColor(location) : "#2f4f2f" }}
      >
        {t("ranking.selectBtn")}
      </button>
    </article>
  );
}
