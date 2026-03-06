// hooks/useDiscipline.ts

import { useEffect, useState } from "react";
import { getDiscipline } from "../../../features/disciplines/services/disciplinesService";
import type { Discipline } from "../../../features/disciplines/services/disciplinesService";

export function useDiscipline(id: number) {
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDiscipline(id)
      .then(setDiscipline)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { discipline, loading, error };
}