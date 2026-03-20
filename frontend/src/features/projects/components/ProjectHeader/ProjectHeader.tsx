import type { TabKey } from "../types";
import { TABS, PROJECT_NAME } from "../../constants/projectConstants";

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewTask: () => void;
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px", borderRadius: 6, fontSize: 13,
        cursor: "pointer", border: "none", fontFamily: "inherit",
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

export function ProjectHeader({ activeTab, onTabChange, onNewTask }: Props) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", height: 52, background: "#ffffff",
      borderBottom: "0.5px solid #e2e0d8", gap: 12, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Logo */}
        <div style={{
          fontFamily: "monospace", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.06em", color: "#1a1a18",
          padding: "5px 9px", border: "0.5px solid #ccc9bf",
          borderRadius: 6, background: "#f4f3ef", userSelect: "none",
        }}>
          proj
        </div>

        {/* Project badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "5px 11px", border: "0.5px solid #e2e0d8",
          borderRadius: 6, fontSize: 13, color: "#6b6960",
          background: "#fff", userSelect: "none",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4a6fa5", display: "inline-block" }} />
          <span>{PROJECT_NAME}</span>
          <span style={{ color: "#ccc9bf" }}>▾</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "#f0efe9", borderRadius: 8, padding: 3 }}>
          {TABS.map(tab => (
            <TabButton
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              onClick={() => onTabChange(tab.key)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onNewTask}
        style={{
          padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
          border: "0.5px solid #1a1a18", background: "#1a1a18", color: "#f4f3ef",
          fontFamily: "inherit",
        }}
      >
        + tarefa
      </button>
    </header>
  );
}