import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Difficulty, Entry } from "@/types/api";

interface EntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: Entry | null;
  onSave: (data: {
    title: string;
    content: string;
    study_hours?: number | null;
    difficulty: Difficulty;
    tags: string[];
  }) => void;
  isPending: boolean;
}

export function EntryModal({ open, onOpenChange, entry, onSave, isPending }: EntryModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setStudyHours(entry.study_hours?.toString() ?? "");
      setDifficulty(entry.difficulty);
      setTagsInput(entry.tags.map((t) => t.name).join(", "));
    } else {
      setTitle("");
      setContent("");
      setStudyHours("");
      setDifficulty("medium");
      setTagsInput("");
    }
  }, [entry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      title: title.trim(),
      content: content.trim(),
      study_hours: studyHours ? parseFloat(studyHours) : null,
      difficulty,
      tags,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit entry" : "New entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you learn?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Notes</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Write your learning notes..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hours">Study hours</Label>
              <Input id="hours" type="number" step="0.25" min="0" value={studyHours} onChange={(e) => setStudyHours(e.target.value)} placeholder="1.5" />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="python, algorithms, sql" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {entry ? "Save changes" : "Create entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
