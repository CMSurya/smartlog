import { motion } from "framer-motion";
import { Bot, FileText, Paperclip, Send, Sparkles, X } from "lucide-react";
import { useRef } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatTime, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/store/settings-store";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  streaming?: boolean;
  attachmentName?: string; // file name shown on user message bubble
}

interface ChatMessageProps {
  message: ChatMsg;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const user = useAuthStore((s) => s.user);
  const profile = useSettingsStore((s) => s.profile);
  const isUser = message.role === "user";
  const name = profile.displayName || user?.email?.split("@")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {isUser ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">{getInitials(name, user?.email)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn("flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]", isUser ? "items-end" : "items-start")}>
        {/* File attachment badge shown on user bubble */}
        {isUser && message.attachmentName && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/80 px-2.5 py-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3 shrink-0 text-primary" />
            <span className="max-w-[180px] truncate">{message.attachmentName}</span>
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser ? "glass bg-primary/20 text-foreground" : "glass border border-border/50",
          )}
        >
          {message.streaming ? <StreamingText text={message.content} /> : <p className="whitespace-pre-wrap">{message.content}</p>}
        </div>
        <span className="px-1 text-[10px] text-muted-foreground">{formatTime(message.timestamp.toISOString())}</span>
      </div>
    </motion.div>
  );
}

function StreamingText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap">
      {text}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="ml-0.5 inline-block"
      >
        ▊
      </motion.span>
    </p>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
        <Sparkles className="h-4 w-4 animate-pulse text-primary" />
      </div>
      <div className="glass flex items-center gap-1 rounded-2xl px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt,.md,.csv";
const MAX_FILE_MB = 10;

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  attachedFile: File | null;
  onFileAttach: (file: File | null) => void;
}

export function ChatInput({ value, onChange, onSubmit, disabled, placeholder, attachedFile, onFileAttach }: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachedFile) && !disabled) onSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`);
      return;
    }
    onFileAttach(file);
    // Reset input so the same file can be re-attached
    e.target.value = "";
  };

  const canSubmit = (value.trim().length > 0 || attachedFile !== null) && !disabled;

  return (
    <div className="border-t border-border/60 bg-background/80 p-4 backdrop-blur-xl">
      {/* Attached file chip */}
      {attachedFile && (
        <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="max-w-[260px] truncate font-medium text-foreground">{attachedFile.name}</span>
            <span className="text-muted-foreground">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
            <button
              type="button"
              onClick={() => onFileAttach(null)}
              className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        </div>
      )}

      <div className="mx-auto flex max-w-3xl gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Attach button */}
        <button
          type="button"
          title="Attach a file (PDF, DOCX, TXT, CSV)"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border transition-all",
            "hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:opacity-50",
            attachedFile ? "border-primary/40 bg-primary/10 text-primary" : "bg-card text-muted-foreground",
          )}
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={attachedFile ? `Ask about ${attachedFile.name}…` : (placeholder ?? "Ask about your notes...")}
          className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground/60">
        Supports PDF, DOCX, TXT, MD, CSV · Max {MAX_FILE_MB} MB
      </p>
    </div>
  );
}

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (s: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 px-4 pb-4">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
