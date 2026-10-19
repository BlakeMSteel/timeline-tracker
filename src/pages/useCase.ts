import { useEffect, useState } from "react";
import { getCase } from "../cases/db";
import type { Case } from "../cases/types";

/** Loads a case by id: undefined while loading, null when it doesn't exist. */
export function useCase(id: string | undefined): Case | null | undefined {
  const [loaded, setLoaded] = useState<{ id: string; c: Case | null } | null>(
    null,
  );

  useEffect(() => {
    if (id) getCase(id).then((c) => setLoaded({ id, c: c ?? null }));
  }, [id]);

  return loaded && loaded.id === id ? loaded.c : undefined;
}
