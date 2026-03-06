// services/postsService.ts

import type { Post } from "../types/disciplineTypes";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function listPosts(disciplineId: number): Promise<Post[]> {
  const res = await fetch(`${BASE}/disciplines/${disciplineId}/posts`);
  if (!res.ok) throw new Error("Erro ao buscar posts.");
  return res.json();
}

export async function createPost(
  disciplineId: number,
  content: string
): Promise<Post> {
  const res = await fetch(`${BASE}/disciplines/${disciplineId}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Erro ao criar post.");
  return res.json();
}

export async function deletePost(postId: number): Promise<void> {
  const res = await fetch(`${BASE}/posts/${postId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao excluir post.");
}