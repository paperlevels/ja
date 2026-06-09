export interface Logline {
  id: string;
  content: string;
  category: string | null;
  share_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  logline_id: string;
  content: string;
  created_at: string;
}

export type SortOrder = "popular" | "newest";
