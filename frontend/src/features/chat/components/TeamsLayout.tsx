import type { ReactNode } from "react";

export function TeamsLayout({
  rail,
  sidebar,
  main,
}: {
  rail: ReactNode;
  sidebar: ReactNode;
  main: ReactNode;
}) {
  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-white">
      {/* Coluna 1: Rail (Barra Estreita Global) */}
      <aside className="h-full flex-shrink-0">
        {rail}
      </aside>

      {/* Coluna 2: Sidebar (Lista de Chat) */}
      <aside className="h-full w-[min(300px,40vw)] min-w-0 flex-shrink-0 border-r border-slate-200 bg-slate-50">
        {sidebar}
      </aside>

      {/* Coluna 3: Main (Conversa Ativa) */}
      <main className="h-full min-w-0 flex-1 relative bg-white">
        {main}
      </main>
    </div>
  );
}
