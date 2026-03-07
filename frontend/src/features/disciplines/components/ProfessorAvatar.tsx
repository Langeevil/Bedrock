export function ProfessorAvatar({ name, colorBg }: Readonly<{ name: string; colorBg: string }>) {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  return (
    <span className={`inline-flex items-center justify-center w-[68px] h-[68px] rounded-full bg-gradient-to-r ${colorBg} text-white text-2xl font-bold shrink-0`}>
      {initials}
    </span>
  );
}