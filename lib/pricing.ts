export const BASE_PICANHA_PRICE = 80;

export const PRICE_INCREASE_LEVELS = [5, 10, 20] as const;

export const PRICE_LEVELS = {
  high: {
    priceLevel: "high",
    priceIncreasePercent: 20,
  },
  medium: {
    priceLevel: "medium",
    priceIncreasePercent: 10,
  },
  low: {
    priceLevel: "low",
    priceIncreasePercent: 5,
  },
} as const;

export const PRICE_CONDITIONS = [
  {
    conditionId: "3.1",
    prices: [PRICE_LEVELS.high, PRICE_LEVELS.medium, PRICE_LEVELS.low],
  },
  {
    conditionId: "3.2",
    prices: [PRICE_LEVELS.low, PRICE_LEVELS.high, PRICE_LEVELS.medium],
  },
  {
    conditionId: "3.3",
    prices: [PRICE_LEVELS.medium, PRICE_LEVELS.low, PRICE_LEVELS.high],
  },
] as const;

export function calculatePrice(basePrice: number, increasePercent: number) {
  return Number((basePrice * (1 + increasePercent / 100)).toFixed(2));
}

export function formatBrazilianCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function createPriceLevels(basePrice = BASE_PICANHA_PRICE) {
  return PRICE_INCREASE_LEVELS.map((increasePercent) => ({
    increasePercent,
    price: calculatePrice(basePrice, increasePercent),
  }));
}
