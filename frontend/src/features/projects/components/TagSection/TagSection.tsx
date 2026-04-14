import { useState } from "react";
import type { Tag, Task } from "../../types/projectTypes";
import { TAG_COLORS } from "../../constants/projectConstants";

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Sub-components ───────────────────────────────────────────────────────────
function TagRow({ tag, taskCount, onDelete }: TagRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "4px 6px", borderRadius: 6, marginBottom: 3,
        background: hovered ? "#f4f3ef" : "transparent",
        transition: "background .12s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 9px", borderRadius: 20,
        fontSize: 12, fontWeight: 500,
        background: tag.color + "22", color: tag.color,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
        {tag.name}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "#9c9a8e", fontFamily: "monospace" }}>{taskCount}</span>
        <button
          onClick={() => onDelete(tag.id)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#9c9a8e", fontSize: 16, lineHeight: 1, padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export function TagSection({ tags, tasks, onAddTag, onDeleteTag }: TagSectionProps) {
  const [name,  setName]  = useState("");
  const [color, setColor] = useState<string>(TAG_COLORS[0]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onAddTag({ name: name.trim(), color });
    setName("");
  };

  const countFor = (id: string) => tasks.filter(t => t.tags.includes(id)).length;

  return (
    <>
      {/* List */}
      <div style={{ padding: 14, borderBottom: "0.5px solid #e2e0d8" }}>
        <div style={{
          fontSize: 10, fontWeight: 500, color: "#9c9a8e",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
        }}>
          Tags do Projeto
        </div>

        {tags.length === 0 && (
          <span style={{ fontSize: 12, color: "#9c9a8e" }}>Nenhuma tag ainda</span>
        )}
        {tags.map(tag => (
          <TagRow key={tag.id} tag={tag} taskCount={countFor(tag.id)} onDelete={onDeleteTag} />
        ))}
      </div>

      {/* Create */}
      <div style={{ padding: 14, borderBottom: "0.5px solid #e2e0d8" }}>
        <div style={{
          fontSize: 10, fontWeight: 500, color: "#9c9a8e",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
        }}>
          Nova Tag
        </div>

        <input
          aria-label="Nome da nova tag"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Nome da tag..."
          maxLength={20}
          style={{
            width: "100%", padding: "6px 9px",
            border: "0.5px solid #e2e0d8", borderRadius: 6,
            fontSize: 12, fontFamily: "inherit", color: "#1a1a18",
            background: "#f4f3ef", outline: "none",
            marginBottom: 7, boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {TAG_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 18, height: 18, borderRadius: "50%",
                background: c, cursor: "pointer", flexShrink: 0,
                transition: "all .12s",
                border: c === color ? "2.5px solid #1a1a18" : "2.5px solid transparent",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleAdd}
          style={{
            width: "100%", padding: "6px 0", borderRadius: 6, fontSize: 12,
            cursor: "pointer", border: "0.5px solid #1a1a18",
            background: "#1a1a18", color: "#f4f3ef", fontFamily: "inherit",
          }}
        >
          Criar Tag
        </button>
      </div>
    </>
  );
}
