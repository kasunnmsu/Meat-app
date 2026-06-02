import { RankingOption } from "@/components/RankingScreen";

export type LocationSealInfo = {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
  description: string;
};

function normalizeLocation(location: string) {
  return location.trim().toUpperCase();
}

export function isUfbaLocation(location: string) {
  return normalizeLocation(location) === "UFBA";
}

export function getSealColorForLocation(location: string) {
  return isUfbaLocation(location) ? "green" : "red";
}

export function getCutFolderForLocation(location: string) {
  return isUfbaLocation(location) ? "ufba" : "pucpr";
}

export function getFallbackTopSealsForLocation(location: string) {
  if (isUfbaLocation(location)) {
    return ["green-1", "green-2", "green-3"];
  }

  return ["red-1", "red-2", "red-3"];
}

export function getSealsForLocation(location: string): LocationSealInfo[] {
  if (isUfbaLocation(location)) {
    return [
      {
        id: "green-1",
        name: "Green Seal 1",
        color: "green",
        imageUrl: "/images/seals/green/1.png",
        description:
          "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha.",
      },
      {
        id: "green-2",
        name: "Green Seal 2",
        color: "green",
        imageUrl: "/images/seals/green/2.png",
        description:
          "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha.",
      },
      {
        id: "green-3",
        name: "Green Seal 3",
        color: "green",
        imageUrl: "/images/seals/green/3.png",
        description:
          "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha.",
      },
      {
        id: "green-4",
        name: "Green Seal 4",
        color: "green",
        imageUrl: "/images/seals/green/4.png",
        description:
          "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha.",
      },
      {
        id: "green-5",
        name: "Green Seal 5",
        color: "green",
        imageUrl: "/images/seals/green/5.png",
        description:
          "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha.",
      },
    ];
  }

  return [
    {
      id: "red-1",
      name: "Red Seal 1",
      color: "red",
      imageUrl: "/images/seals/red/1.png",
      description:
        "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray.",
    },
    {
      id: "red-2",
      name: "Red Seal 2",
      color: "red",
      imageUrl: "/images/seals/red/2.png",
      description:
        "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray.",
    },
    {
      id: "red-3",
      name: "Red Seal 3",
      color: "red",
      imageUrl: "/images/seals/red/3.png",
      description:
        "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray.",
    },
    {
      id: "red-4",
      name: "Red Seal 4",
      color: "red",
      imageUrl: "/images/seals/red/4.png",
      description:
        "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray.",
    },
    {
      id: "red-5",
      name: "Red Seal 5",
      color: "red",
      imageUrl: "/images/seals/red/5.png",
      description:
        "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray.",
    },
  ];
}

export function getRankingOptionsForLocation(
  location: string,
  sessionNumber: 1 | 2
): RankingOption[] {
  const isUfba = isUfbaLocation(location);
  const seals = getSealsForLocation(location);
  const cutFolder = getCutFolderForLocation(location);

  return seals.map((seal, index) => {
    const optionNumber = index + 1;

    return {
      id: `session-${sessionNumber}-option-${optionNumber}`,
      cutId: `${cutFolder}-cut-${optionNumber}`,
      sealId: seal.id,
      title: `Beef Option ${optionNumber} - ${seal.name}`,
      subtitle: isUfba
        ? "Whole vacuum-packed picanha with green seal"
        : "Sliced picanha in black tray with red seal",
      cutImageUrl: `/images/cuts/${cutFolder}/${optionNumber}.png`,
      sealImageUrl: seal.imageUrl,
      sealColor: seal.color,
    };
  });
}