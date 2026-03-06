// components/posts/PostList.tsx

import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { Post } from "../../types/disciplineTypes";
import { PostItem } from "./PostItem";

interface Props {
  posts: Post[];
  loading: boolean;
  onDelete?: (id: number) => void;
}

export function PostList({ posts, loading, onDelete }: Readonly<Props>) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3 py-16 text-center"
      >
        <div className="p-4 rounded-2xl bg-slate-100">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm font-medium">Nenhum post ainda.</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <PostItem post={post} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}