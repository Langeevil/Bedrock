// src/features/library/types/libraryTypes.ts

export interface Resource {
  id: number;
  title: string;
  type: "artigo" | "video" | "ebook";
  subject: string;
}
