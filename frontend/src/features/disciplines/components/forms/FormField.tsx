import { AlertCircle } from "lucide-react";

export function FormField({ icon: Icon, label, id, placeholder, error, registration }: Readonly<{
  icon: React.ElementType; label: string; id: string; placeholder: string; error?: string; registration: object;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />{label}
      </label>
      <input id={id} type="text" placeholder={placeholder} {...registration}
        className={`w-full px-3 py-2.5 rounded-xl border text-slate-800 text-sm placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:border-transparent transition ${error ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-slate-200 focus:ring-blue-400"}`}
      />
      {error && <p className="flex items-center gap-1.5 text-xs text-red-500 mt-0.5"><AlertCircle className="w-3 h-3 shrink-0" />{error}</p>}
    </div>
  );
}