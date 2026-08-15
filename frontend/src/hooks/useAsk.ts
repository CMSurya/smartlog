import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-client";
import { askApi } from "@/services/api";
import type { AskRequest } from "@/types/api";

export function useAsk() {
  return useMutation({
    mutationFn: (data: AskRequest) => askApi.ask(data),
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to get answer")),
  });
}

export function useAskWithFile() {
  return useMutation({
    mutationFn: ({ question, file }: { question: string; file: File }) =>
      askApi.askWithFile(question, file),
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to analyze file")),
  });
}
