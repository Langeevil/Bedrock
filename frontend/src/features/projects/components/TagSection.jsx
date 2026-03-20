import { useState } from "react";
import { TAG_COLORS } from "../constants";

const css = {
  section: { padding: "14px 14px", borderBottom: "0.5px solid #e2e0d8" },
  sectionTitle: {
    fontSize: 10, fontWeight: 500, color: "#9c9a8e",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
  },
  tagRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "4px 6px", borderRadius: 6, marginBottom: 3,
    transition: "background .12s",
  },
  pill: (color) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 9px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    background: color + "22", color,
  }),
  dot: (color) => ({ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }),
  count: { fontSize: 11, color: "#9c9a8e", fontFamily: "monospace" },
  removeBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#9c9a8e", fontSize: 15, lineHeight: 1, padding: "0 2px",
  },
  input: {
    width: "100%", padding: "6px 9px",
    border: "0.5px solid #e2e0d8", borderRadius: 6,
    fontSize: 12, fontFamily: "inherit", color: "#1a1a18",
    background: "#f4f3ef", outline: "none", marginBottom: 7,
  },
  colorRow: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 },
  swatch: (color, active) => ({
    width: 18, height: 18, borderRadius: "50%", background: color,
    cursor: "pointer", flexShrink: 0, transition: "all .12s",
    border: active ? "2.5px solid #1a1a18" : "2.5px solid transparent",
  }),
  addBtn: {
    width: "100%", padding: "6px 0", borderRadius: 6, fontSize: 12,
    cursor: "pointer", border: "0.5px solid #1a1a18",
    background: "#1a1a18", color: "#f4f3ef", fontFamily: "inherit",
  },
};

function TagRow({ tag, taskCount, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...css.tagRow, background: hovered ? "#f4f3ef" : "transparent" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={css.pill(tag.color)}>
        <span style={css.dot(tag.color)} />
        {tag.name}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={css.count}>{taskCount}</span>
        <button style={css.removeBtn} onClick={() => onDelete(tag.id)}>×</button>
      </div>
    </div>
  );
}

export function TagSection({ tags, tasks, onAddTag, onDeleteTag }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddTag({ id: "tg" + Date.now(), name: name.trim(), color });
    setName("");
  };

  const taskCountFor = (id) => tasks.filter(t => t.tags.includes(id)).length;

  return (
    <>
      {/* Tags list */}
      <div style={css.section}>
        <div style={css.sectionTitle}>Tags do Projeto</div>
        {tags.length === 0 && (
          <span style={{ fontSize: 12, color: "#9c9a8e" }}>Nenhuma tag ainda</span>
        )}
        {tags.map(tag => (
          <TagRow
            key={tag.id}
            tag={tag}
            taskCount={taskCountFor(tag.id)}
            onDelete={onDeleteTag}
          />
        ))}
      </div>

      {/* Create tag */}
      <div style={css.section}>
        <div style={css.sectionTitle}>Nova Tag</div>
        <input
          style={css.input}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Nome da tag..."
          maxLength={20}
        />
        <div style={css.colorRow}>
          {TAG_COLORS.map(c => (
            <div
              key={c}
              style={css.swatch(c, c === color)}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button style={css.addBtn} onClick={handleAdd}>Criar Tag</button>
      </div>
    </>
  );
}