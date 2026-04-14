import { AlertCircle } from "lucide-react";

export function FormField({ icon: Icon, label, id, placeholder, error, registration }: Readonly<{
  icon: React.ElementType; label: string; id: string; placeholder: string; error?: string; registration: object;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-[var(--app-text)]">
        <Icon className="w-3.5 h-3.5 text-slate-400" />{label}
      </label>
      <input id={id} type="text" placeholder={placeholder} {...registration}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:border-transparent focus:outline-none focus:ring-2 transition ${error ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-[var(--app-border)] bg-[var(--app-bg-muted)] focus:ring-blue-400"}`}
      />
      {error && <p className="flex items-center gap-1.5 text-xs text-red-500 mt-0.5"><AlertCircle className="w-3 h-3 shrink-0" />{error}</p>}
    </div>
  );
}
