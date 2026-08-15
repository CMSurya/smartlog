import { motion } from "framer-motion";
import { Clock, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Difficulty, Entry } from "@/types/api";

const difficultyVariant: Record<Difficulty, "success" | "warning" | "danger"> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  index?: number;
}

export function EntryCard({ entry, onEdit, onDelete, index = 0 }: EntryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="truncate text-base">{entry.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(entry)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(entry)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">{entry.content}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={difficultyVariant[entry.difficulty]} className="capitalize">
              {entry.difficulty}
            </Badge>
            {entry.study_hours != null && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {entry.study_hours}h
              </span>
            )}
            {entry.tags.map((t) => (
              <Badge key={t.id} variant="secondary">
                {t.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
