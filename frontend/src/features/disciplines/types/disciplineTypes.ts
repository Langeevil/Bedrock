// src/features/disciplines/types/disciplineTypes.ts

export type TabKey = "overview" | "materials" | "chat" | "settings";

export interface Post {
  id: number;
  disciplineId: number;
  authorId: number;
  authorName: string;
  authorEmail: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  comments: number;
  // Campos de anexo (opcionais)
  fileId?: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export type DisciplinePost = Post;

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


export interface Material {
  id: number;
  discipline_id: number;

  original_name: string;
  mime_type: string;
  size_bytes: number;

  created_at: string;
  updated_at?: string;

  url?: string;
}