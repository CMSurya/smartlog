import { useQuery } from "@tanstack/react-query";

import { qk } from "@/lib/query-client";
import { statsApi } from "@/services/api";

export function useStats() {
  return useQuery({
    queryKey: qk.stats,
    queryFn: () => statsApi.get(),
  });
}
