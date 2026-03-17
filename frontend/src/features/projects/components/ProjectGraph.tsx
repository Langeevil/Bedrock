import { useEffect, useRef } from "react";
import type { Project } from "../types/projectTypes";

interface Props {
  projects: Project[];
}

const STATUS_COLOR: Record<string, { base: string; glow: string }> = {
  planejado:      { base: "#5e8de6", glow: "rgba(94,141,230,0.35)" },
  "em andamento": { base: "#e6b35e", glow: "rgba(230,179,94,0.35)" },
  concluido:      { base: "#5ec47a", glow: "rgba(94,196,122,0.35)" },
};

type GraphNode = Project & {
  links: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export function ProjectGraph({ projects }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    nodes: [] as GraphNode[],
    pan: { x: 0, y: 0 },
    zoom: 1,
    dragging: null as GraphNode | null,
    dragOffset: { x: 0, y: 0 },
    panning: false,
    panStart: { x: 0, y: 0 },
    panOrigin: { x: 0, y: 0 },
    hovered: null as GraphNode | null,
    filter: "all",
    animId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const st = stateRef.current;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Build nodes — link by shared status (keeps it interesting without backend data)
    st.nodes = projects.map((p, i) => {
      const angle = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
      const r = Math.min(W(), H()) * 0.28;
      return {
        ...p,
        links: projects
          .filter((q) => q.id !== p.id && (q.status === p.status || Math.abs(projects.indexOf(q) - i) === 1))
          .map((q) => q.id)
          .slice(0, 3),
        x: W() / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: H() / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      } as GraphNode;
    });

    const getRadius = (n: GraphNode) =>
      7 + (n.links.length) * 2;

    const toScreen = (x: number, y: number) => ({
      sx: x * st.zoom + st.pan.x,
      sy: y * st.zoom + st.pan.y,
    });

    const toWorld = (sx: number, sy: number) => ({
      x: (sx - st.pan.x) / st.zoom,
      y: (sy - st.pan.y) / st.zoom,
    });

    const isVisible = (n: GraphNode) =>
      st.filter === "all" || n.status === st.filter;

    const getNode = (sx: number, sy: number) => {
      const { x, y } = toWorld(sx, sy);
      return st.nodes.find((n) => {
        const dx = n.x - x, dy = n.y - y, r = getRadius(n);
        return isVisible(n) && dx * dx + dy * dy < r * r;
      });
    };

    const simulate = () => {
      st.nodes.forEach((a) => {
        if (!isVisible(a)) return;
        let fx = 0, fy = 0;
        st.nodes.forEach((b) => {
          if (a.id === b.id || !isVisible(b)) return;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < 160) { fx += (dx / d) * 2800 / (d * d); fy += (dy / d) * 2800 / (d * d); }
        });
        a.links.forEach((bid: string) => {
          const b = st.nodes.find((n) => n.id === bid);
          if (!b || !isVisible(b)) return;
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const target = 140;
          fx += (dx / d) * (d - target) / 180;
          fy += (dy / d) * (d - target) / 180;
        });
        fx += (W() / 2 - a.x) * 0.003;
        fy += (H() / 2 - a.y) * 0.003;
        a.vx = (a.vx + fx) * 0.82;
        a.vy = (a.vy + fy) * 0.82;
        if (st.dragging?.id !== a.id) { a.x += a.vx; a.y += a.vy; }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      // Grid dots
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      const gs = 32;
      for (let gx = st.pan.x % gs; gx < W(); gx += gs)
        for (let gy = st.pan.y % gs; gy < H(); gy += gs) {
          ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill();
        }

      // Edges
      st.nodes.forEach((a) => {
        if (!isVisible(a)) return;
        a.links.forEach((bid: string) => {
          const b = st.nodes.find((n) => n.id === bid);
          if (!b || !isVisible(b)) return;
          const sa = toScreen(a.x, a.y), sb = toScreen(b.x, b.y);
          const hov = st.hovered && (st.hovered.id === a.id || st.hovered.id === b.id);
          ctx.beginPath();
          ctx.moveTo(sa.sx, sa.sy);
          ctx.lineTo(sb.sx, sb.sy);
          ctx.strokeStyle = hov ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)";
          ctx.lineWidth = hov ? 1.2 : 0.6;
          ctx.stroke();
        });
      });

      // Nodes
      st.nodes.forEach((node) => {
        if (!isVisible(node)) return;
        const { sx, sy } = toScreen(node.x, node.y);
        const r = getRadius(node) * st.zoom;
        const col = STATUS_COLOR[node.status] || STATUS_COLOR["planejado"];
        const isHov = st.hovered?.id === node.id;

        if (isHov) {
          const grd = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 3);
          grd.addColorStop(0, col.glow); grd.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }

        ctx.beginPath(); ctx.arc(sx, sy, r + 2, 0, Math.PI * 2);
        ctx.fillStyle = col.base + "22"; ctx.fill();

        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = col.base; ctx.fill();

        ctx.beginPath(); ctx.arc(sx - r * 0.22, sy - r * 0.22, r * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fill();

        const fs = Math.max(9, Math.min(13, 11 * st.zoom));
        ctx.font = `${fs}px sans-serif`;
        ctx.fillStyle = isHov ? "#ffffff" : "rgba(255,255,255,0.65)";
        ctx.textAlign = "center";
        ctx.fillText(node.title, sx, sy + r + fs + 2);
      });
    };

    const loop = () => {
      simulate(); draw();
      st.animId = requestAnimationFrame(loop);
    };
    loop();

    // Mouse events
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      if (st.dragging) {
        const { x, y } = toWorld(sx, sy);
        st.dragging.x = x + st.dragOffset.x;
        st.dragging.y = y + st.dragOffset.y;
        st.dragging.vx = 0; st.dragging.vy = 0;
      } else if (st.panning) {
        st.pan.x = st.panOrigin.x + (sx - st.panStart.x);
        st.pan.y = st.panOrigin.y + (sy - st.panStart.y);
      } else {
        st.hovered = getNode(sx, sy) ?? null;
        canvas.style.cursor = st.hovered ? "pointer" : "grab";
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      const hit = getNode(sx, sy);
      if (hit) {
        st.dragging = hit;
        const { x, y } = toWorld(sx, sy);
        st.dragOffset = { x: hit.x - x, y: hit.y - y };
      } else {
        st.panning = true;
        st.panStart = { x: sx, y: sy };
        st.panOrigin = { ...st.pan };
      }
    };

    const onMouseUp = () => { st.dragging = null; st.panning = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      const { x: wx, y: wy } = toWorld(sx, sy);
      const delta = e.deltaY > 0 ? 0.88 : 1.12;
      st.zoom = Math.max(0.25, Math.min(4, st.zoom * delta));
      st.pan.x = sx - wx * st.zoom;
      st.pan.y = sy - wy * st.zoom;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(st.animId);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", resize);
    };
  }, [projects]);

  const filters = [
    { key: "all", label: "Todos" },
    { key: "planejado", label: "Planejados" },
    { key: "em andamento", label: "Em Andamento" },
    { key: "concluido", label: "Concluídos" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: 480, background: "#0d1117", borderRadius: 16, overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* Filter pills */}
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8 }}>
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { stateRef.current.filter = key; }}
            style={{
              background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.13)",
              borderRadius: 99, padding: "4px 12px", fontSize: 12, color: "rgba(255,255,255,0.55)",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(STATUS_COLOR).map(([key, { base }]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: base }} />
            {key}
          </div>
        ))}
      </div>
    </div>
  );
}