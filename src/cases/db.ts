import { openDB, type DBSchema } from "idb";
import type { Activity, Case } from "./types";

type ActivityWithLegacyDuration = Activity & { duration?: number };

export function convertLegacyDurationsToEnds(c: Case): Case {
  return {
    ...c,
    actors: c.actors.map((actor) => ({
      ...actor,
      activities: actor.activities.map((a: ActivityWithLegacyDuration) => {
        if (a.end !== undefined) return a;
        const { duration = 30, ...rest } = a;
        return { ...rest, end: a.start + duration };
      }),
    })),
  };
}

interface TimelineTrackerDB extends DBSchema {
  cases: {
    key: string;
    value: Case;
  };
}

const dbPromise = openDB<TimelineTrackerDB>("timeline-tracker", 1, {
  upgrade(db) {
    db.createObjectStore("cases", { keyPath: "id" });
  },
});

export async function listCases(): Promise<Case[]> {
  const cases = (await (await dbPromise).getAll("cases")).map(
    convertLegacyDurationsToEnds,
  );
  return cases.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getCase(id: string): Promise<Case | undefined> {
  const c = await (await dbPromise).get("cases", id);
  return c && convertLegacyDurationsToEnds(c);
}

export async function saveCase(c: Case): Promise<void> {
  await (await dbPromise).put("cases", { ...c, updatedAt: Date.now() });
}

export async function deleteCase(id: string): Promise<void> {
  await (await dbPromise).delete("cases", id);
}
