import type { Task, Tag, GraphNode, GraphEdge, GraphData, Camera } from "../types";
import { STATUS_NODE_COLOR, PROJECT_ID, PROJECT_NAME } from "../constants/projectConstants";

export function buildGraph(
  tasks: Task[],
  tags: Tag[],
  W: number,
  H: number
): GraphData {
  const cx = W / 2;
  const cy = H / 2;

  const nodes: GraphNode[] = [
    {
      id: `p-${PROJECT_ID}`,
      label: PROJECT_NAME,
      type: "project",
      color: "#1a1a18",
      r: 22,
      x: cx, y: cy, vx: 0, vy: 0,
    },
    ...tags.map((tg, i): GraphNode => {
      const angle = (i / Math.max(tags.length, 1)) * Math.PI * 2;
      return {
        id: `tg-${tg.id}`, label: tg.name, type: "tag",
        color: tg.color, r: 14, tagId: tg.id,
        x: cx + Math.cos(angle) * 155,
        y: cy + Math.sin(angle) * 155,
        vx: 0, vy: 0,
      };
    }),
    ...tasks.map((tk, i): GraphNode => {
      const angle = (i / Math.max(tasks.length, 1)) * Math.PI * 2 + 0.4;
      return {
        id: `tk-${tk.id}`, label: tk.title, type: "task",
        color: STATUS_NODE_COLOR[tk.status], r: 15,
        taskId: tk.id, status: tk.status,
        x: cx + Math.cos(angle) * 245,
        y: cy + Math.sin(angle) * 245,
        vx: 0, vy: 0,
      };
    }),
  ];

  const edges: GraphEdge[] = [];
  const pid = `p-${PROJECT_ID}`;

  tags.forEach(tg => edges.push({ s: pid, t: `tg-${tg.id}`, rel: "has_tag" }));
  tasks.forEach(tk => {
    edges.push({ s: pid, t: `tk-${tk.id}`, rel: "contains" });
    tk.tags.forEach(tagId => {
      if (tags.find(x => x.id === tagId))
        edges.push({ s: `tk-${tk.id}`, t: `tg-${tagId}`, rel: "labeled_with" });
    });
  });

  // Force-directed simulation
  for (let iter = 0; iter < 90; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const f = 2800 / (dist * dist);
        const fx = (f * dx) / dist, fy = (f * dy) / dist;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }
    edges.forEach(e => {
      const a = nodes.find(n => n.id === e.s);
      const b = nodes.find(n => n.id === e.t);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const target = e.rel === "labeled_with" ? 95 : 150;
      const f = (dist - target) * 0.03;
      const fx = (f * dx) / dist, fy = (f * dy) / dist;
      if (a.type !== "project") { a.vx += fx; a.vy += fy; }
      if (b.type !== "project") { b.vx -= fx; b.vy -= fy; }
    });
    nodes.forEach(n => {
      if (n.type === "project") return;
      n.x += n.vx * 0.4; n.y += n.vy * 0.4;
      n.vx *= 0.6; n.vy *= 0.6;
    });
  }

  return { nodes, edges };
}

export function renderGraph(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  nodes: GraphNode[],
  edges: GraphEdge[],
  cam: Camera
): void {
  const { ox, oy, scale } = cam;
  ctx.clearRect(0, 0, W, H);

  // Dot grid
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  const gs = 28;
  const gox = ((ox % gs) + gs) % gs;
  const goy = ((oy % gs) + gs) % gs;
  for (let x = gox; x < W; x += gs)
    for (let y = goy; y < H; y += gs) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // Edges
  edges.forEach(e => {
    const a = nodes.find(n => n.id === e.s);
    const b = nodes.find(n => n.id === e.t);
    if (!a || !b) return;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    if (e.rel === "labeled_with") {
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = "rgba(0,0,0,0.13)";
      ctx.setLineDash([]);
      ctx.lineWidth = 1.5;
    }
    ctx.stroke(); ctx.setLineDash([]);
  });

  // Nodes
  nodes.forEach(n => {
    if (n.type === "task") {
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = n.color + "44"; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = n.color; ctx.fill();

    const maxCh = n.type === "project" ? 18 : 13;
    const lbl = n.label.length > maxCh ? n.label.slice(0, maxCh - 1) + "…" : n.label;
    ctx.font = n.type === "project"
      ? "500 11px 'DM Sans',system-ui,sans-serif"
      : "400 10px 'DM Sans',system-ui,sans-serif";
    ctx.textAlign = "center";
    if (n.type === "project") {
      ctx.fillStyle = "#fff"; ctx.fillText(lbl, n.x, n.y + 4);
    } else {
      ctx.fillStyle = "#1a1a18"; ctx.fillText(lbl, n.x, n.y + n.r + 13);
    }
  });

  ctx.restore();
}

export function hitTest(
  nodes: GraphNode[],
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  cam: Camera
): GraphNode | undefined {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left - cam.ox) / cam.scale;
  const my = (e.clientY - rect.top  - cam.oy) / cam.scale;
  return nodes.find(n => Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) < n.r + 5);
}