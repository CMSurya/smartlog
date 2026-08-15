import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChatInput,
  ChatMessage,
  type ChatMsg,
  SuggestionChips,
  TypingIndicator,
} from "@/components/chat/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAsk, useAskWithFile } from "@/hooks/useAsk";

const SUGGESTIONS = [
  "What did I learn about databases?",
  "Summarize my recent entries",
  "What topics have I studied most?",
  "Explain my hardest concepts",
];

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const ask = useAsk();
  const askWithFile = useAskWithFile();
  const bottomRef = useRef<HTMLDivElement>(null);

  const isPending = ask.isPending || askWithFile.isPending;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const streamAnswer = useCallback((fullText: string, msgId: string) => {
    let i = 0;
    const interval = setInterval(() => {
      i += Math.max(2, Math.floor(fullText.length / 40));
      const chunk = fullText.slice(0, i);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, content: chunk, streaming: i < fullText.length } : m,
        ),
      );
      if (i >= fullText.length) clearInterval(interval);
    }, 20);
  }, []);

  const sendQuestion = useCallback(
    (question: string) => {
      const q = question.trim();
      if ((!q && !attachedFile) || isPending) return;

      // Need at least a question when there's no file; when there's a file, default prompt if empty
      const finalQuestion = q || (attachedFile ? `Explain and summarize ${attachedFile.name}` : "");
      if (!finalQuestion) return;

      const userMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content: finalQuestion,
        timestamp: new Date(),
        attachmentName: attachedFile?.name,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      const onSuccess = (res: { answer: string }) => {
        const assistantId = crypto.randomUUID();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            streaming: true,
          },
        ]);
        streamAnswer(res.answer, assistantId);
      };

      if (attachedFile) {
        const fileToSend = attachedFile;
        setAttachedFile(null);
        askWithFile.mutate({ question: finalQuestion, file: fileToSend }, { onSuccess });
      } else {
        ask.mutate({ question: finalQuestion }, { onSuccess });
      }
    },
    [ask, askWithFile, attachedFile, isPending, streamAnswer],
  );

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col py-6">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
              <h2 className="mb-2 text-2xl font-semibold">Ask your notes</h2>
              <p className="mb-8 max-w-md text-muted-foreground">
                SmartLog searches your journal and answers using retrieval-augmented generation.
                You can also attach a PDF, DOCX, or text file for instant analysis.
              </p>
              <SuggestionChips suggestions={SUGGESTIONS} onSelect={sendQuestion} />
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {isPending && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length > 0 && (
        <SuggestionChips
          suggestions={SUGGESTIONS.slice(0, 2)}
          onSelect={sendQuestion}
        />
      )}

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => sendQuestion(input)}
        disabled={isPending}
        attachedFile={attachedFile}
        onFileAttach={setAttachedFile}
      />
    </div>
  );
}
