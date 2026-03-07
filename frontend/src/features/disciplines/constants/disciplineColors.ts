export const COLORS = [
  {
    bg: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  {
    bg: "from-blue-500 to-cyan-600",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  {
    bg: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    bg: "from-rose-500 to-pink-600",
    light: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  {
    bg: "from-amber-500 to-orange-600",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  {
    bg: "from-indigo-500 to-blue-600",
    light: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
];

export function getColor(id: number) {
  return COLORS[id % COLORS.length];
}