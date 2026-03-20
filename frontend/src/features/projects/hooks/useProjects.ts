import { useState } from "react";
import { INIT_TASKS, INIT_TAGS } from "../constants";

export function useProjects() {
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [tags, setTags] = useState(INIT_TAGS);

  const addTag = (tag) => setTags((prev) => [...prev, tag]);

  const deleteTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    setTasks((prev) => prev.map((t) => ({ ...t, tags: t.tags.filter((tid) => tid !== id) })));
  };

  const addTask = (task) => setTasks((prev) => [...prev, task]);

  const updateTask = (updated) =>
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    tagCount: tags.length,
  };

  return { tasks, tags, stats, addTag, deleteTag, addTask, updateTask, deleteTask };
}
