type StudyLocation = "PUCPR" | "UFBA" | "NMSU";

type SealTranslationKey =
  | "seal.angus.full"
  | "seal.angus.short"
  | "seal.angus.desc"
  | "seal.welfare.full"
  | "seal.welfare.short"
  | "seal.welfare.desc"
  | "seal.traditional.full"
  | "seal.traditional.short"
  | "seal.traditional.desc"
  | "seal.cultivated.full"
  | "seal.cultivated.short"
  | "seal.cultivated.desc"
  | "seal.organic.full"
  | "seal.organic.short"
  | "seal.organic.desc";

const DEFAULT_LOCATION: StudyLocation = "PUCPR";

type SealMetadata = {
  id: string;
  fullName: string;
  shortName: string;
  description: string;
  fullNameKey: SealTranslationKey;
  shortNameKey: SealTranslationKey;
  descriptionKey: SealTranslationKey;
  imageFileByLocation: Record<StudyLocation, string>;
};

export type SealDefinition = Omit<SealMetadata, "imageFileByLocation"> & {
  color: string;
  imageUrl: string;
};

const SEAL_METADATA: SealMetadata[] = [
  {
    id: "red-1",
    fullName: "Certificação Angus",
    shortName: "Angus",
    description:
      "Carne reconhecida pela maciez e sabor intensos e diferenciados característicos da raça Angus.",
    fullNameKey: "seal.angus.full",
    shortNameKey: "seal.angus.short",
    descriptionKey: "seal.angus.desc",
    imageFileByLocation: {
      PUCPR: "a.png",
      UFBA: "a.png",
      NMSU: "angus.png",
    },
  },
  {
    id: "red-2",
    fullName: "Certificação Bem-Estar Animal",
    shortName: "Bem-estar animal",
    description:
      "Proveniente de sistemas de produção que priorizam conforto, manejo adequado e bem-estar dos animais.",
    fullNameKey: "seal.welfare.full",
    shortNameKey: "seal.welfare.short",
    descriptionKey: "seal.welfare.desc",
    imageFileByLocation: {
      PUCPR: "bea.png",
      UFBA: "bea.png",
      NMSU: "animal.png",
    },
  },
  {
    id: "green-1",
    fullName: "Selo de Carne Bovina",
    shortName: "Tradicional",
    description: "Produto não possui qualquer tipo de certificação especial.",
    fullNameKey: "seal.traditional.full",
    shortNameKey: "seal.traditional.short",
    descriptionKey: "seal.traditional.desc",
    imageFileByLocation: {
      PUCPR: "cb.png",
      UFBA: "cb.png",
      NMSU: "beef.png",
    },
  },
  {
    id: "green-2",
    fullName: "Certificação Carne Cultivada",
    shortName: "Cultivada",
    description:
      "Produzida a partir do cultivo de células animais em ambiente controlado, sem a necessidade de abate.",
    fullNameKey: "seal.cultivated.full",
    shortNameKey: "seal.cultivated.short",
    descriptionKey: "seal.cultivated.desc",
    imageFileByLocation: {
      PUCPR: "cc.png",
      UFBA: "cc.png",
      NMSU: "cultured.png",
    },
  },
  {
    id: "green-3",
    fullName: "Certificação Orgânica",
    shortName: "Orgânica",
    description:
      "Produzida em sistema que preserva o meio ambiente, sem uso de hormônios sintéticos ou antibióticos.",
    fullNameKey: "seal.organic.full",
    shortNameKey: "seal.organic.short",
    descriptionKey: "seal.organic.desc",
    imageFileByLocation: {
      PUCPR: "o.png",
      UFBA: "o.png",
      NMSU: "organic.png",
    },
  },
];

const SEAL_COLOR_BY_LOCATION: Record<StudyLocation, string> = {
  PUCPR: "red",
  UFBA: "green",
  NMSU: "red",
};

function createLocationSeals(location: StudyLocation): SealDefinition[] {
  return SEAL_METADATA.map(({ imageFileByLocation, ...seal }) => ({
    ...seal,
    color: SEAL_COLOR_BY_LOCATION[location],
    imageUrl: `/images/seals/${location.toLowerCase()}/${imageFileByLocation[location]}`,
  }));
}

const SEALS_BY_LOCATION: Record<StudyLocation, SealDefinition[]> = {
  PUCPR: createLocationSeals("PUCPR"),
  UFBA: createLocationSeals("UFBA"),
  NMSU: createLocationSeals("NMSU"),
};

export function getSealDefinitions(location: string) {
  return SEALS_BY_LOCATION[location as StudyLocation] || SEALS_BY_LOCATION[DEFAULT_LOCATION];
}

export function getSealNameKey(sealId?: string, variant: "full" | "short" = "short") {
  const seal = SEAL_METADATA.find((item) => item.id === sealId) || SEAL_METADATA[2];
  return variant === "full" ? seal.fullNameKey : seal.shortNameKey;
}
