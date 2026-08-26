import path from "node:path";

export const RESULT_LOCATIONS = ["PUCPR", "UFBA", "NMSU"] as const;

export type ResultLocation = (typeof RESULT_LOCATIONS)[number];
export type ResultCategory =
  | "session-1"
  | "session-2"
  | "session-3"
  | "full-survey"
  | "click-logs";
export type ResultArea = "analysis" | "technical";

export function isResultLocation(value: string): value is ResultLocation {
  return RESULT_LOCATIONS.includes(value as ResultLocation);
}

export function getResultsDirectory(
  location: string,
  category: ResultCategory,
  rootDirectory = process.cwd()
) {
  if (!isResultLocation(location)) {
    throw new Error("Invalid study location for data storage.");
  }

  return path.join(rootDirectory, "data", location, category);
}

export function getRelativeResultsDirectory(
  location: string,
  category: ResultCategory
) {
  if (!isResultLocation(location)) {
    throw new Error("Invalid study location for data storage.");
  }

  return `data/${location}/${category}`;
}

export function getResultsAreaDirectory(
  location: string,
  category: ResultCategory,
  area: ResultArea,
  rootDirectory = process.cwd()
) {
  return path.join(
    getResultsDirectory(location, category, rootDirectory),
    area
  );
}

export function getRelativeResultsAreaDirectory(
  location: string,
  category: ResultCategory,
  area: ResultArea
) {
  return `${getRelativeResultsDirectory(location, category)}/${area}`;
}

export function getLegacyResultPath(
  filename: string,
  rootDirectory = process.cwd()
) {
  return path.join(rootDirectory, "data", filename);
}
