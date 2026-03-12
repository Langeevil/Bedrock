// src/features/disciplines/services/postsService.ts
import { getAuthHeaders, parseJsonOrThrow } from "../../../shared/services/http";
import type { Post } from "../types/disciplineTypes";

const API_URL = "http://localhost:4000/api/disciplines";

export interface PostsPaginationResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function listPosts(
  disciplineId: number,
  page = 1,
  limit = 20
): Promise<PostsPaginationResponse> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao buscar posts");

  return data as PostsPaginationResponse;
}

export async function createPost(
  disciplineId: number,
  content: string
): Promise<Post> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ content }),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao criar post");

  return data as Post;
}

export async function deletePost(
  disciplineId: number,
  postId: number
): Promise<void> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts/${postId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao deletar post");
}
