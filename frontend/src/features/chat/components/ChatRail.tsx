import type { FilterMode } from "../utils/chatFormatters";
import { conversationTypeLabel, initials } from "../utils/chatFormatters";

const filters: FilterMode[] = ["all", "direct", "group", "channel"];

export function ChatRail({
  currentUserName,
  currentUserEmail,
  activeFilter,
  onFilterChange,
  onNewGroup,
  onNewChannel,
}: {
  currentUserName: string;
  currentUserEmail: string;
  activeFilter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
  onNewGroup: () => void;
  onNewChannel: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center gap-4 px-3 py-5 text-white">
      <div
        title={`${currentUserName} - ${currentUserEmail}`}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold"
      >
        {initials(currentUserName || currentUserEmail)}
      </div>

      <div className="h-px w-10 bg-white/15" />

      <div className="flex flex-col gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            title={conversationTypeLabel(filter)}
            onClick={() => onFilterChange(filter)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-semibold transition ${
              activeFilter === filter
                ? "bg-white text-slate-950"
                : "bg-white/10 text-white/75 hover:bg-white/20 hover:text-white"
            }`}
          >
            {filter === "all" ? "T" : filter.slice(0, 1).toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          title="Novo grupo"
          onClick={onNewGroup}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-semibold text-white transition hover:bg-emerald-400"
        >
          G
        </button>
        <button
          type="button"
          title="Novo canal"
          onClick={onNewChannel}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-semibold text-white transition hover:bg-blue-400"
        >
          C
        </button>
      </div>
    </div>
  );
}
