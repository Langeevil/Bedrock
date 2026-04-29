import { useState } from "react";
import type { Tag, Task } from "../../types/projectTypes";
import { TAG_COLORS } from "../../constants/projectConstants";

interface TagSectionProps {
  tags: Tag[];
  tasks: Task[];
  onAddTag: (payload: Omit<Tag, "id" | "project_id">) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
}

interface TagRowProps {
  tag: Tag;
  taskCount: number;
  onDelete: (id: string) => void;
}

function TagRow({ tag, taskCount, onDelete }: TagRowProps) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-[var(--app-bg-muted)]">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
        style={{ background: `${tag.color}22`, color: tag.color }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: tag.color }} />
        {tag.name}
      </span>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-[var(--app-text-muted)]">{taskCount}</span>
        <button
          type="button"
          onClick={() => onDelete(tag.id)}
          className="app-icon-button inline-flex min-h-[30px] min-w-[30px] items-center justify-center rounded-lg text-sm transition"
          aria-label={`Excluir tag ${tag.name}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function TagSection({ tags, tasks, onAddTag, onDeleteTag }: TagSectionProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(TAG_COLORS[0]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onAddTag({ name: name.trim(), color });
    setName("");
  };

  const countFor = (id: string) => tasks.filter((task) => task.tags.includes(id)).length;

  return (
    <>
      <div className="border-b border-[var(--app-border)] px-4 py-5">
        <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
          Tags do projeto
        </div>

        {tags.length === 0 && (
          <span className="text-xs text-[var(--app-text-muted)]">Nenhuma tag ainda</span>
        )}
        {tags.map((tag) => (
          <TagRow key={tag.id} tag={tag} taskCount={countFor(tag.id)} onDelete={onDeleteTag} />
        ))}
      </div>

      <div className="border-b border-[var(--app-border)] px-4 py-4">
        <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
          Nova tag
        </div>

        <input
          aria-label="Nome da nova tag"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleAdd()}
          placeholder="Nome da tag..."
          maxLength={20}
          className="input input-bordered app-field !rounded-lg mb-3 w-full text-xs"
        />

        <div className="mb-3 flex flex-wrap gap-2">
          {TAG_COLORS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setColor(item)}
              aria-label={`Selecionar cor ${item}`}
              className={`h-6 w-6 rounded-full border-2 transition ${
                item === color ? "border-[var(--app-text)]" : "border-transparent"
              }`}
              style={{ backgroundColor: item }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-primary app-btn-primary min-h-[40px] !rounded-lg w-full border-0 px-4 text-sm"
        >
          Criar tag
        </button>
      </div>
    </>
  );
}
