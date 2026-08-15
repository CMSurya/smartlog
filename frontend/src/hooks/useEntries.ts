import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-client";
import { qk } from "@/lib/query-client";
import { entriesApi } from "@/services/api";
import type { EntriesQueryParams, EntryCreate, EntryUpdate } from "@/types/api";

const PAGE_SIZE = 12;

export function useEntriesInfinite(params: Omit<EntriesQueryParams, "skip" | "limit">) {
  return useInfiniteQuery({
    queryKey: qk.entriesList(params),
    queryFn: ({ pageParam = 0 }) =>
      entriesApi.list({ ...params, skip: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
  });
}

export function useEntryMutations() {
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: qk.entries });

  const create = useMutation({
    mutationFn: (data: EntryCreate) => entriesApi.create(data),
    onSuccess: () => {
      invalidate();
      toast.success("Entry created");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create entry")),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EntryUpdate }) =>
      entriesApi.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Entry updated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update entry")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => entriesApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Entry deleted");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete entry")),
  });

  return { create, update, remove };
}
