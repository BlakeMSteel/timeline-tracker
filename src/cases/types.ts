import type { LocationIconKey } from "./locationIcons";

export type MinutesFromMidnight = number;
export type FractionOfImageSize = number;

export interface CaseMap {
  name: string;
  description: string;
  image: Blob | null;
}

export interface Location {
  id: string;
  name: string;
  x: FractionOfImageSize;
  y: FractionOfImageSize;
  icon?: LocationIconKey;
  details?: string;
}

export const NO_LOCATION_ID = "";

export interface Activity {
  id: string;
  locationId: string;
  description: string;
  start: MinutesFromMidnight;
  end: MinutesFromMidnight;
}

export interface Actor {
  id: string;
  name: string;
  description: string;
  color: string;
  activities: Activity[];
}

export interface Case {
  id: string;
  map: CaseMap;
  locations: Location[];
  actors: Actor[];
  updatedAt: number;
}

export const ACTOR_COLORS = [
  "#d32f2f",
  "#1976d2",
  "#f57c00",
  "#7b1fa2",
  "#388e3c",
  "#c2185b",
  "#0097a7",
  "#5d4037",
];

export function newCase(): Case {
  return {
    id: crypto.randomUUID(),
    map: { name: "", description: "", image: null },
    locations: [],
    actors: [],
    updatedAt: Date.now(),
  };
}

export function caseTitle(c: Case): string {
  return c.map.name || "Untitled case";
}
