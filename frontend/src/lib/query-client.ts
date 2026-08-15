import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const qk = {
  entries: ["entries"] as const,
  entriesList: (params: Record<string, unknown>) => ["entries", "list", params] as const,
  stats: ["stats"] as const,
};
