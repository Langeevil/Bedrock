import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Pagination,} from "../../services/disciplinesService";

export function PaginationBar({ pagination, onPageChange }: Readonly<{ pagination: Pagination; onPageChange: (page: number) => void }>) {
  const { page, totalPages, totalItems, hasPrevPage, hasNextPage } = pagination;
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 px-1">
      <p className="text-sm text-slate-400 order-2 sm:order-1">{totalItems} disciplina{totalItems === 1 ? "" : "s"} no total</p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button onClick={() => onPageChange(page - 1)} disabled={!hasPrevPage} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-blue-500 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>{p}</button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={!hasNextPage} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}