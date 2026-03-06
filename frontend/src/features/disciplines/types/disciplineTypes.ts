// types/disciplineTypes.ts
// Tipos exclusivos da feature de disciplinas (Discipline vem de src/services/disciplinesService.ts)

export interface Post {
  id: number;
  disciplineId: number;
  authorName: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Material {
  id: number;
  disciplineId: number;
  name: string;
  type: "pdf" | "doc" | "image" | "video" | "other";
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface Member {
  id: number;
  name: string;
  role: "professor" | "student";
  joinedAt: string;
}

export interface ChatMessageType {
  id: number;
  disciplineId: number;
  authorName: string;
  content: string;
  createdAt: string;
  isMine?: boolean;
}

export type TabKey = "overview" | "posts" | "materials" | "chat" | "members" | "settings";