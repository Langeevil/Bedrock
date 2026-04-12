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
    <div className={`grid h-full min-h-0 gap-4 overflow-y-auto xl:overflow-hidden ${
      rail 
        ? "xl:grid-cols-[5rem_22rem_minmax(0,1fr)]" 
        : "xl:grid-cols-[22rem_minmax(0,1fr)]"
    }`}>
      {rail && (
        <aside className="hidden min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 shadow-sm xl:flex">
          {rail}
        </aside>
      )}
      <aside className="flex min-h-[24rem] min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm xl:min-h-0">
        {sidebar}
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {main}
      </main>
    </div>
  );
}
