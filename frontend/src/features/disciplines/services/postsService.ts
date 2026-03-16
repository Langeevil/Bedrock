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

function mapBackendPostToFrontend(p: any): Post {
  return {
    id: p.id,
    disciplineId: p.discipline_id,
    authorId: p.author_id,
    authorName: p.author_name || "Usuário",
    authorEmail: p.author_email || "",
    content: p.content,
    pinned: Boolean(p.pinned),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    likes: 0,
    comments: 0,
    fileId: p.file_id,
    fileName: p.file_name,
    fileType: p.file_type,
    fileSize: p.file_size,
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

  return {
    ...data,
    data: (data.data || []).map(mapBackendPostToFrontend),
  } as PostsPaginationResponse;
}

export async function createPost(
  disciplineId: number,
  content: string,
  fileId?: number
): Promise<Post> {
  const res = await fetch(
    `${API_URL}/${disciplineId}/posts`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ content, fileId }),
    }
  );

  const data = await parseJsonOrThrow(res);
  if (!res.ok) throw new Error(data.error || "Falha ao criar post");

  return mapBackendPostToFrontend(data);
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
