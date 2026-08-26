type PricedOption = {
  price?: number;
  priceLocale?: string;
  priceCurrencySymbol?: string;
  priceCurrency?: string;
  priceUnitLabel?: string;
  priceUnit?: string;
};

export function formatOptionPrice(option: PricedOption) {
  if (typeof option.price !== "number") {
    return "";
  }

  const value = option.price.toLocaleString(option.priceLocale || "pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${option.priceCurrencySymbol || option.priceCurrency || "R$"} ${value} ${option.priceUnitLabel || option.priceUnit || "/ kg"}`;
}
