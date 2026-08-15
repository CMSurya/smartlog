export type Difficulty = "easy" | "medium" | "hard";

export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserSignup {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TagResponse {
  id: string;
  name: string;
}

export interface Entry {
  id: string;
  title: string;
  content: string;
  study_hours: number | null;
  difficulty: Difficulty;
  tags: TagResponse[];
  created_at: string;
  updated_at: string;
}

export interface EntryCreate {
  title: string;
  content: string;
  study_hours?: number | null;
  difficulty: Difficulty;
  tags?: string[];
}

export interface EntryUpdate {
  title?: string;
  content?: string;
  study_hours?: number | null;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface EntryListResponse {
  items: Entry[];
  total: number;
}

export interface AskRequest {
  question: string;
}

export interface AskResponse {
  answer: string;
  sources?: string[];
}

export interface TopicHours {
  topic: string;
  hours: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  hours: number;
}

export interface StatsResponse {
  current_streak: number;
  longest_streak: number;
  total_hours: number;
  total_entries: number;
  hours_by_topic: TopicHours[];
  heatmap: HeatmapDay[];
}

export interface EntriesQueryParams {
  search?: string;
  tag?: string;
  skip?: number;
  limit?: number;
}
