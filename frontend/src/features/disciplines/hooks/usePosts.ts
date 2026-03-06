// hooks/usePosts.ts

import { useCallback, useEffect, useState } from "react";
import type { Post } from "../types/disciplineTypes";
import { createPost, deletePost, listPosts } from "../services/postsService";

export function usePosts(disciplineId: number) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listPosts(disciplineId);
      setPosts(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [disciplineId]);

  useEffect(() => {
    if (disciplineId) load();
  }, [disciplineId, load]);

  const addPost = async (content: string) => {
    const post = await createPost(disciplineId, content);
    setPosts((prev) => [post, ...prev]);
    return post;
  };

  const removePost = async (postId: number) => {
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return { posts, loading, error, reload: load, addPost, removePost };
}