import type { ReactNode } from "react";

export function ChatLayout({
  rail,
  sidebar,
  main,
}: {
  rail: ReactNode | null;
  sidebar: ReactNode;
  main: ReactNode;
}) {
  return (
    <div className={`grid h-full min-h-0 grid-cols-1 gap-3 overflow-y-auto lg:gap-4 xl:overflow-hidden ${
      rail 
        ? "xl:grid-cols-[5rem_22rem_minmax(0,1fr)]" 
        : "xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]"
    }`}>
      {rail && (
        <aside className="hidden min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 shadow-sm xl:flex">
          {rail}
        </aside>
      )}
      <aside className="flex min-h-[22rem] min-w-0 overflow-hidden rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] shadow-sm xl:min-h-0">
        {sidebar}
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-bg-elevated)] shadow-sm">
        {main}
      </main>
    </div>
  );
}
