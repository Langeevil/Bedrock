// src/features/disciplines/types/disciplineTypes.ts

export type TabKey = "overview" | "materials" | "chat" | "settings";

export interface DisciplinePost {
  id: number;
  author: { nome: string };
  content: string;
  created_at: string;
  pinned: boolean;
}

export interface DisciplineFile {
  id: number;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  uploaded_by_name?: string;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "file" | "post" | "user";
  timestamp: Date;
}