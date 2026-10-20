import { useEffect, useState } from "react";
import { getCase } from "../cases/db";
import type { Case } from "../cases/types";

export type CaseLoadResult = Case | "loading" | "not-found";

export function useCase(id: string | undefined): CaseLoadResult {
  const [loaded, setLoaded] = useState<{
    id: string;
    result: Case | "not-found";
  } | null>(null);

  useEffect(() => {
    if (id)
      getCase(id).then((c) => setLoaded({ id, result: c ?? "not-found" }));
  }, [id]);

  return loaded && loaded.id === id ? loaded.result : "loading";
}
