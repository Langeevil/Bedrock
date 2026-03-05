// services/disciplinePostsService.ts
import { getAuthHeaders, parseJsonOrThrow } from "./http";

const API_URL = "http://localhost:4000/api/disciplines";

// Types
export interface User {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
}

export interface DisciplinePost {
  readonly id: number;
  readonly discipline_id: number;
  readonly author_id: number;
  readonly author: User;
  readonly content: string;
  readonly pinned: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

export interface CreatePostRequest {
  readonly content: string;
  readonly pinned?: boolean;
}

export interface UpdatePostRequest {
  readonly content?: string;
  readonly pinned?: boolean;
}

export interface PostsPaginationResponse {
  readonly data: DisciplinePost[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly totalItems: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

/**
 * List posts from a discipline with pagination
 */
export async function getDisciplinePosts(
  disciplineId: string | number,
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

  return data;
}

/**
 * Get a specific post
 */
export async function getDisciplinePost(
  disciplineId: string | number,
  postId: string | number
): Promise<DisciplinePost> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts/${postId}`,
    {
      method: "GET",
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao buscar post");

  return data;
}

/**
 * Create a new post
 */
export async function createDisciplinePost(
  disciplineId: string | number,
  request: CreatePostRequest
): Promise<DisciplinePost> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(request),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao criar post");

  return data;
}

/**
 * Update a post
 */
export async function updateDisciplinePost(
  disciplineId: string | number,
  postId: string | number,
  request: UpdatePostRequest
): Promise<DisciplinePost> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts/${postId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: JSON.stringify(request),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao atualizar post");

  return data;
}

/**
 * Delete a post
 */
export async function deleteDisciplinePost(
  disciplineId: string | number,
  postId: string | number
): Promise<{ readonly message: string; readonly id: number }> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts/${postId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(false),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao deletar post");

  return data;
}

export default {
  getDisciplinePosts,
  getDisciplinePost,
  createDisciplinePost,
  updateDisciplinePost,
  deleteDisciplinePost,
};
