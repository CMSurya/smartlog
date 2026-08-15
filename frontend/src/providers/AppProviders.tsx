import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/providers/ThemeProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster richColors closeButton position="top-right" theme="system" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
