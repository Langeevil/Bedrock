import type { FilterMode } from "../utils/chatFormatters";
import { conversationTypeLabel } from "../utils/chatFormatters";

const filters: FilterMode[] = ["all", "direct", "group", "channel"];

export function ChatConversationToolbar({
  filter,
  onFilterChange,
}: {
  filter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onFilterChange(value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            filter === value
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
          }`}
        >
          {conversationTypeLabel(value)}
        </button>
      ))}
    </div>
  );
}
