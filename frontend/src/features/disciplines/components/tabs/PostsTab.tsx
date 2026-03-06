// components/tabs/PostsTab.tsx

import { toast } from "sonner";
import { usePosts } from "../../hooks/usePosts";
import { CreatePost } from "../posts/CreatePost";
import { PostList } from "../posts/PostList";

interface Props {
  disciplineId: number;
}

export function PostsTab({ disciplineId }: Readonly<Props>) {
  const { posts, loading, addPost, removePost } = usePosts(disciplineId);

  const handleCreate = async (content: string) => {
    try {
      await addPost(content);
      toast.success("Post publicado!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao publicar.");
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await removePost(postId);
      toast.success("Post excluído.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir.");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <CreatePost onSubmit={handleCreate} />
      <PostList posts={posts} loading={loading} onDelete={handleDelete} />
    </div>
  );
}