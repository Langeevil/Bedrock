import { PROJECT, TABS } from "../constants";

const css = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    height: 52,
    background: "#ffffff",
    borderBottom: "0.5px solid #e2e0d8",
    position: "sticky",
    top: 0,
    zIndex: 100,
    gap: 12,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  left: { display: "flex", alignItems: "center", gap: 12 },
  logo: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#1a1a18",
    padding: "5px 9px",
    border: "0.5px solid #ccc9bf",
    borderRadius: 6,
    background: "#f4f3ef",
    userSelect: "none",
  },
  projBadge: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "5px 11px",
    border: "0.5px solid #e2e0d8",
    borderRadius: 6,
    fontSize: 13,
    color: "#6b6960",
    background: "#fff",
    userSelect: "none",
  },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#4a6fa5" },
  tabs: {
    display: "flex",
    gap: 2,
    background: "#f0efe9",
    borderRadius: 8,
    padding: 3,
  },
  btnPrimary: {
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    border: "0.5px solid #1a1a18",
    background: "#1a1a18",
    color: "#f4f3ef",
    fontFamily: "inherit",
    transition: "opacity .15s",
  },
};

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 6,
        fontSize: 13,
        cursor: "pointer",
        border: "none",
        fontFamily: "inherit",
        background: active ? "#fff" : "transparent",
        color: active ? "#1a1a18" : "#6b6960",
        boxShadow: active ? "0 0 0 0.5px #e2e0d8" : "none",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}

export function ProjectHeader({ activeTab, onTabChange, onNewTask }) {
  return (
    <header style={css.header}>
      <div style={css.left}>
        <div style={css.logo}>proj</div>
        <div style={css.projBadge}>
          <span style={css.dot} />
          <span>{PROJECT.name}</span>
          <span style={{ color: "#ccc9bf" }}>▾</span>
        </div>
        <div style={css.tabs}>
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              onClick={() => onTabChange(tab.key)}
            />
          ))}
        </div>
      </div>
      <div>
        <button style={css.btnPrimary} onClick={onNewTask}>
          + tarefa
        </button>
      </div>
    </header>
  );
}
