// src/features/disciplines/components/Avatar.tsx

interface Props {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 36 }: Readonly<Props>) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colors = ["#6264A7", "#0078D4", "#038387", "#C239B3", "#CA5010", "#8764B8"];
  const color = colors[(name.codePointAt(0) ?? 0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}