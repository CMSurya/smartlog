import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EntryCard } from "@/components/entries/EntryCard";
import { EntryModal } from "@/components/entries/EntryModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntriesInfinite, useEntryMutations } from "@/hooks/useEntries";
import type { Entry } from "@/types/api";

export default function EntriesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);

  const { create, update, remove } = useEntryMutations();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useEntriesInfinite({
    search: debouncedSearch || undefined,
    tag: tagFilter || undefined,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allEntries = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    allEntries.forEach((e) => e.tags.forEach((t) => set.add(t.name)));
    return Array.from(set).sort();
  }, [allEntries]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (entry: Entry) => {
    setEditing(entry);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    (formData: Parameters<typeof create.mutate>[0]) => {
      if (editing) {
        update.mutate(
          { id: editing.id, data: formData },
          { onSuccess: () => setModalOpen(false) },
        );
      } else {
        create.mutate(formData, { onSuccess: () => setModalOpen(false) });
      }
    },
    [create, update, editing],
  );

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Entries</h2>
          <p className="text-muted-foreground">Your learning journal.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> New entry
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tagFilter === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setTagFilter("")}
            >
              All
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={tagFilter === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setTagFilter(tagFilter === tag ? "" : tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : allEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">No entries found</p>
          <p className="mb-4 text-sm text-muted-foreground">Create your first learning log.</p>
          <Button onClick={openCreate}>Create entry</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allEntries.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              index={i}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && <Skeleton className="mx-auto h-8 w-32" />}

      <EntryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        entry={editing}
        onSave={handleSave}
        isPending={create.isPending || update.isPending}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (deleteTarget) {
                  remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
