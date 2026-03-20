import { useState } from "react";
import type { Tag, Task } from "../types";
import { TAG_COLORS } from "../../constants/projectConstants";

interface Props {
  tags: Tag[];
  tasks: Task[];
  onAddTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
}

interface TagCardProps {
  tag: Tag;
  relatedTasks: Task[];
  onDelete: (id: string) => void;
}

function TagCard({ tag, relatedTasks, onDelete }: TagCardProps) {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #e2e0d8",
      borderRadius: 10, padding: "14px 15px",
      borderTop: `3px solid ${tag.color}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1a18" }}>{tag.name}</span>
        <button
          onClick={() => onDelete(tag.id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#9c9a8e", fontSize: 16, lineHeight: 1, padding: "0 2px" }}
        >
          ×
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#9c9a8e", marginBottom: 6 }}>
        {relatedTasks.length} {relatedTasks.length === 1 ? "tarefa" : "tarefas"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {relatedTasks.slice(0, 3).map(t => (
          <div key={t.id} style={{
            fontSize: 11, color: "#6b6960", background: "#f4f3ef",
            padding: "3px 7px", borderRadius: 5,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {t.title}
          </div>
        ))}
        {relatedTasks.length > 3 && (
          <div style={{ fontSize: 11, color: "#9c9a8e", padding: "3px 7px" }}>
            +{relatedTasks.length - 3} mais
          </div>
        )}
      </div>
    </div>
  );
}

interface CreateFormProps {
  onAdd: (tag: Tag) => void;
}

function CreateTagForm({ onAdd }: CreateFormProps) {
  const [name,  setName]  = useState("");
  const [color, setColor] = useState<string>(TAG_COLORS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ id: "tg" + Date.now(), name: name.trim(), color });
    setName("");
  };

  return (
    <div style={{ background: "#fff", border: "0.5px solid #e2e0d8", borderRadius: 10, padding: 18, maxWidth: 380 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18", marginBottom: 14 }}>Criar nova tag</div>

      <span style={{ display: "block", fontSize: 10, color: "#9c9a8e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        Nome
      </span>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleAdd()}
        placeholder="Nome da tag..."
        maxLength={20}
        style={{
          width: "100%", padding: "7px 10px", border: "0.5px solid #e2e0d8", borderRadius: 6,
          fontSize: 13, fontFamily: "inherit", color: "#1a1a18",
          background: "#f4f3ef", outline: "none", boxSizing: "border-box",
        }}
      />

      <span style={{ display: "block", fontSize: 10, color: "#9c9a8e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, marginTop: 12 }}>
        Cor
      </span>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
        {TAG_COLORS.map(c => (
          <div
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 22, height: 22, borderRadius: "50%", background: c,
              cursor: "pointer", flexShrink: 0, transition: "all .12s",
              border: c === color ? "2.5px solid #1a1a18" : "2.5px solid transparent",
            }}
          />
        ))}
      </div>

      <button
        onClick={handleAdd}
        style={{
          padding: "7px 18px", borderRadius: 6, fontSize: 13, cursor: "pointer",
          border: "0.5px solid #1a1a18", background: "#1a1a18", color: "#f4f3ef", fontFamily: "inherit",
        }}
      >
        Criar Tag
      </button>
    </div>
  );
}

export function TagsView({ tags, tasks, onAddTag, onDeleteTag }: Props) {
  const relatedTasks = (tagId: string) => tasks.filter(t => t.tags.includes(tagId));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f4f3ef" }}>
      {tags.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
          {tags.map(tag => (
            <TagCard key={tag.id} tag={tag} relatedTasks={relatedTasks(tag.id)} onDelete={onDeleteTag} />
          ))}
        </div>
      )}

      <CreateTagForm onAdd={onAddTag} />
    </div>
  );
}