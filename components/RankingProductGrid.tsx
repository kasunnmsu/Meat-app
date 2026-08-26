"use client";

import type { MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { RankingOption } from "@/components/RankingScreen";

type RankingProductGridProps = {
  options: RankingOption[];
  location?: string;
  sealZoom?: boolean;
  onSelect: (option: RankingOption, event?: MouseEvent<HTMLElement>) => void;
  onSealClick?: (option: RankingOption) => void;
  onSealZoomOpen?: (option: RankingOption) => void;
  onSealZoomClose?: (option: RankingOption) => void;
};

export default function RankingProductGrid({
  options,
  location,
  sealZoom,
  onSelect,
  onSealClick,
  onSealZoomOpen,
  onSealZoomClose,
}: RankingProductGridProps) {
  return (
    <section className="product-grid">
      <AnimatePresence mode="popLayout">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0.18 },
            }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div
              onClickCapture={(event) => {
                const target = event.target as HTMLElement;

                if (target.closest("button") || target.closest("a")) {
                  return;
                }

                onSelect(option, event);
              }}
            >
              <ProductCard
                option={option}
                displayedPosition={index + 1}
                location={location}
                sealZoom={sealZoom}
                onSelect={() => onSelect(option)}
                onSealClick={
                  onSealClick ? () => onSealClick(option) : undefined
                }
                onSealZoomOpen={
                  onSealZoomOpen ? () => onSealZoomOpen(option) : undefined
                }
                onSealZoomClose={
                  onSealZoomClose ? () => onSealZoomClose(option) : undefined
                }
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}
