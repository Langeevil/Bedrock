import { useState } from "react";
import type { Tag, Task } from "../../types/projectTypes";
import { TAG_COLORS } from "../../constants/projectConstants";

interface TagsViewProps {
  tags: Tag[];
  tasks: Task[];
  onAddTag: (payload: Omit<Tag, "id" | "project_id">) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
}

function TagCard({
  tag,
  relatedTasks,
  onDelete,
}: {
  tag: Tag;
  relatedTasks: Task[];
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-4 shadow-sm"
      style={{ borderTopWidth: "3px", borderTopColor: tag.color }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-[var(--app-text)]">{tag.name}</span>
        <button
          type="button"
          onClick={() => onDelete(tag.id)}
          className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-lg leading-none text-[var(--app-text-muted)] transition hover:bg-[var(--app-bg-muted)] hover:text-[var(--app-text)]"
        >
          ×
        </button>
      </div>

      <div className="mb-3 text-xs text-[var(--app-text-muted)]">
        {relatedTasks.length} {relatedTasks.length === 1 ? "tarefa" : "tarefas"}
      </div>

      <div className="flex flex-col gap-2">
        {relatedTasks.slice(0, 3).map((task) => (
          <div
            key={task.id}
            className="truncate rounded-lg bg-[var(--app-bg-muted)] px-3 py-2 text-xs text-[var(--app-text-muted)]"
          >
            {task.title}
          </div>
        ))}
        {relatedTasks.length > 3 && (
          <div className="px-1 text-xs text-[var(--app-text-muted)]">
            +{relatedTasks.length - 3} mais
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTagForm({
  onAdd,
}: {
  onAdd: (payload: Omit<Tag, "id" | "project_id">) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(TAG_COLORS[0]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onAdd({ name: name.trim(), color });
    setName("");
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)] p-4 shadow-sm sm:p-5">
      <div className="mb-4 text-sm font-semibold text-[var(--app-text)]">Criar nova tag</div>

      <label className="mb-3 block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
          Nome
        </span>
        <input
          aria-label="Nome da nova tag"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleAdd()}
          placeholder="Nome da tag..."
          maxLength={20}
          className="input input-bordered app-input min-h-[44px] w-full text-base"
        />
      </label>

      <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-muted)]">
        Cor
      </span>
      <div className="mb-4 flex flex-wrap gap-2">
        {TAG_COLORS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setColor(item)}
            className={`h-8 w-8 rounded-full border-2 transition ${
              item === color ? "border-[var(--app-text)]" : "border-transparent"
            }`}
            style={{ backgroundColor: item }}
            aria-label={`Selecionar cor ${item}`}
          />
        ))}
      </div>

      <button type="button" onClick={handleAdd} className="btn btn-primary min-h-[44px] border-0">
        Criar tag
      </button>
    </div>
  );
}

export function TagsView({ tags, tasks, onAddTag, onDeleteTag }: TagsViewProps) {
  const relatedTasks = (tagId: string) => tasks.filter((task) => task.tags.includes(tagId));

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--app-bg)] p-4 sm:p-6">
      {tags.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              relatedTasks={relatedTasks(tag.id)}
              onDelete={onDeleteTag}
            />
          ))}
        </div>
      )}

      <CreateTagForm onAdd={onAddTag} />
    </div>
  );
}
