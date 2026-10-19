/** The image a case is plotted on. */
export interface CaseMap {
  name: string;
  description: string;
  image: Blob | null;
}

/** A named point on the map. x and y are fractions (0–1) of the image's width and height. */
export interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
}

/** Something an actor did. start and duration are in minutes; start counts from midnight. */
export interface Activity {
  id: string;
  /** Empty when no place has been picked yet. */
  locationId: string;
  description: string;
  start: number;
  duration: number;
}

export interface Actor {
  id: string;
  name: string;
  description: string;
  color: string;
  activities: Activity[];
}

/** One day under investigation: a map, its places, and the actors moving through them. */
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
