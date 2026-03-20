import { useState } from "react";
import { TAG_COLORS } from "../constants";

const css = {
  container: {
    flex: 1,
    overflowY: "auto",
    padding: 24,
    background: "#f4f3ef",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 10,
    marginBottom: 24,
  },
  tagCard: (color) => ({
    background: "#fff",
    border: "0.5px solid #e2e0d8",
    borderRadius: 10,
    padding: "14px 15px",
    borderTop: "3px solid " + color,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  }),
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  tagName: { fontSize: 14, fontWeight: 500, color: "#1a1a18" },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9c9a8e",
    fontSize: 16,
    lineHeight: 1,
    padding: "0 2px",
    transition: "color .12s",
  },
  taskCount: { fontSize: 12, color: "#9c9a8e" },
  tasksChips: { display: "flex", flexDirection: "column", gap: 3 },
  taskChip: {
    fontSize: 11,
    color: "#6b6960",
    background: "#f4f3ef",
    padding: "3px 7px",
    borderRadius: 5,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  // Create form
  formCard: {
    background: "#fff",
    border: "0.5px solid #e2e0d8",
    borderRadius: 10,
    padding: "18px 18px",
    maxWidth: 380,
  },
  formTitle: { fontSize: 13, fontWeight: 500, color: "#1a1a18", marginBottom: 14 },
  formLabel: {
    display: "block",
    fontSize: 10,
    color: "#9c9a8e",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    width: "100%",
    padding: "7px 10px",
    border: "0.5px solid #e2e0d8",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    color: "#1a1a18",
    background: "#f4f3ef",
    outline: "none",
    boxSizing: "border-box",
  },
  colorRow: { display: "flex", gap: 7, flexWrap: "wrap" },
  swatch: (color, active) => ({
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: color,
    cursor: "pointer",
    flexShrink: 0,
    transition: "all .12s",
    border: active ? "2.5px solid #1a1a18" : "2.5px solid transparent",
  }),
  addBtn: {
    marginTop: 14,
    padding: "7px 18px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    border: "0.5px solid #1a1a18",
    background: "#1a1a18",
    color: "#f4f3ef",
    fontFamily: "inherit",
  },
};

export function TagsView({ tags, tasks, onAddTag, onDeleteTag }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddTag({ id: "tg" + Date.now(), name: name.trim(), color });
    setName("");
  };

  const taggedTasks = (tagId) => tasks.filter((t) => t.tags.includes(tagId));

  return (
    <div style={css.container}>
      {/* Tag cards grid */}
      {tags.length > 0 && (
        <div style={css.grid}>
          {tags.map((tag) => {
            const related = taggedTasks(tag.id);
            return (
              <div key={tag.id} style={css.tagCard(tag.color)}>
                <div style={css.cardTop}>
                  <span style={css.tagName}>{tag.name}</span>
                  <button style={css.removeBtn} onClick={() => onDeleteTag(tag.id)}>
                    ×
                  </button>
                </div>
                <div style={css.taskCount}>
                  {related.length} {related.length === 1 ? "tarefa" : "tarefas"}
                </div>
                {related.length > 0 && (
                  <div style={css.tasksChips}>
                    {related.slice(0, 3).map((t) => (
                      <div key={t.id} style={css.taskChip}>
                        {t.title}
                      </div>
                    ))}
                    {related.length > 3 && (
                      <div style={{ ...css.taskChip, color: "#9c9a8e" }}>
                        +{related.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create new tag */}
      <div style={css.formCard}>
        <div style={css.formTitle}>Criar nova tag</div>
        <span style={css.formLabel}>Nome</span>
        <input
          style={css.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nome da tag..."
          maxLength={20}
        />
        <span style={css.formLabel}>Cor</span>
        <div style={css.colorRow}>
          {TAG_COLORS.map((c) => (
            <div key={c} style={css.swatch(c, c === color)} onClick={() => setColor(c)} />
          ))}
        </div>
        <button style={css.addBtn} onClick={handleAdd}>
          Criar Tag
        </button>
      </div>
    </div>
  );
}
