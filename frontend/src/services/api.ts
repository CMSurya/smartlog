import { apiClient } from "@/lib/api-client";
import type {
  AskRequest,
  AskResponse,
  EntriesQueryParams,
  Entry,
  EntryCreate,
  EntryListResponse,
  EntryUpdate,
  StatsResponse,
  TokenResponse,
  User,
  UserLogin,
  UserSignup,
} from "@/types/api";

export const authApi = {
  signup: (data: UserSignup) =>
    apiClient.post<User>("/auth/signup", data).then((r) => r.data),
  login: (data: UserLogin) =>
    apiClient.post<TokenResponse>("/auth/login", data).then((r) => r.data),
};

export const entriesApi = {
  list: (params?: EntriesQueryParams) =>
    apiClient
      .get<EntryListResponse>("/entries", { params })
      .then((r) => r.data),
  create: (data: EntryCreate) =>
    apiClient.post<Entry>("/entries", data).then((r) => r.data),
  update: (id: string, data: EntryUpdate) =>
    apiClient.put<Entry>(`/entries/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/entries/${id}`),
};

export const askApi = {
  ask: (data: AskRequest) =>
    apiClient.post<AskResponse>("/ask", data).then((r) => r.data),

  askWithFile: (question: string, file: File) => {
    const form = new FormData();
    form.append("question", question);
    form.append("file", file);
    return apiClient
      .post<AskResponse>("/ask/file", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};


export const statsApi = {
  get: () => apiClient.get<StatsResponse>("/stats").then((r) => r.data),
};
