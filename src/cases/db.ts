import { openDB, type DBSchema } from "idb";
import type { Case } from "./types";

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
  const cases = await (await dbPromise).getAll("cases");
  return cases.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getCase(id: string): Promise<Case | undefined> {
  return (await dbPromise).get("cases", id);
}

export async function saveCase(c: Case): Promise<void> {
  await (await dbPromise).put("cases", { ...c, updatedAt: Date.now() });
}

export async function deleteCase(id: string): Promise<void> {
  await (await dbPromise).delete("cases", id);
}
