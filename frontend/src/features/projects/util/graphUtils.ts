import type {
  Task, Tag, GraphNode, GraphEdge, GraphData, Camera,
} from "../types/projectTypes";
import { STATUS_NODE_COLOR } from "../constants/projectConstants";

const PROJECT_NODE_ID = "p-root";

// ─────────────────────────────────────────────────────────────────────────────
// Graph model:
//   • Project node  — center hub
//   • Tag nodes     — mid-ring hubs (one per tag)
//   • Task nodes    — outer ring
//
// Edges:
//   Project → Tag   (project_to_tag)
//   Tag → Task      (task_to_tag)     ← task belongs to this tag group
//   Project → Task  (project_to_task) ← tasks with NO tags connect directly
// ─────────────────────────────────────────────────────────────────────────────

export function buildGraph(
  tasks: Task[],
  tags: Tag[],
  projectName: string,
  W: number,
  H: number,
): GraphData {
  const cx = W / 2;
  const cy = H / 2;

  // Project node
  const nodes: GraphNode[] = [
    {
      id: PROJECT_NODE_ID, label: projectName,
      type: "project", color: "#1a1a18", r: 24,
      x: cx, y: cy, vx: 0, vy: 0,
    },
  ];

  // Tag nodes — arranged in mid ring
  tags.forEach((tg, i) => {
    const angle = (i / Math.max(tags.length, 1)) * Math.PI * 2;
    nodes.push({
      id: `tg-${tg.id}`, label: tg.name, type: "tag",
      color: tg.color, r: 18, tagId: tg.id,
      x: cx + Math.cos(angle) * 160,
      y: cy + Math.sin(angle) * 160,
      vx: 0, vy: 0,
    });
  });

  // Task nodes — outer ring
  tasks.forEach((tk, i) => {
    const angle = (i / Math.max(tasks.length, 1)) * Math.PI * 2 + 0.3;
    nodes.push({
      id: `tk-${tk.id}`, label: tk.title, type: "task",
      color: STATUS_NODE_COLOR[tk.status], r: 14,
      taskId: tk.id, status: tk.status,
      x: cx + Math.cos(angle) * 270,
      y: cy + Math.sin(angle) * 270,
      vx: 0, vy: 0,
    });
  });

  const edges: GraphEdge[] = [];

  // Project → Tag edges
  tags.forEach(tg => {
    edges.push({ s: PROJECT_NODE_ID, t: `tg-${tg.id}`, rel: "project_to_tag" });
  });

  // Task edges — either Tag → Task (if tagged) or Project → Task (if untagged)
  tasks.forEach(tk => {
    if (tk.tags.length > 0) {
      tk.tags.forEach(tagId => {
        if (tags.find(x => x.id === tagId)) {
          edges.push({ s: `tg-${tagId}`, t: `tk-${tk.id}`, rel: "task_to_tag" });
        }
      });
    } else {
      edges.push({ s: PROJECT_NODE_ID, t: `tk-${tk.id}`, rel: "project_to_task" });
    }
  });

  runForce(nodes, edges);
  return { nodes, edges };
}

function runForce(nodes: GraphNode[], edges: GraphEdge[]): void {
  for (let iter = 0; iter < 100; iter++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const f  = 3200 / (dist * dist);
        const fx = (f * dx) / dist, fy = (f * dy) / dist;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }
    // Attraction
    edges.forEach(e => {
      const a = nodes.find(n => n.id === e.s);
      const b = nodes.find(n => n.id === e.t);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const target = e.rel === "project_to_tag" ? 160
                   : e.rel === "task_to_tag"    ? 110
                   : 200;
      const f  = (dist - target) * 0.04;
      const fx = (f * dx) / dist, fy = (f * dy) / dist;
      if (a.type !== "project") { a.vx += fx; a.vy += fy; }
      if (b.type !== "project") { b.vx -= fx; b.vy -= fy; }
    });
    // Integrate + dampen
    nodes.forEach(n => {
      if (n.type === "project") return;
      n.x += n.vx * 0.4; n.y += n.vy * 0.4;
      n.vx *= 0.6;        n.vy *= 0.6;
    });
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
export function renderGraph(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  nodes: GraphNode[],
  edges: GraphEdge[],
  cam: Camera,
): void {
  const { ox, oy, scale } = cam;
  ctx.clearRect(0, 0, W, H);

  // Dot grid
  ctx.fillStyle = "rgba(0,0,0,0.045)";
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
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    if (e.rel === "task_to_tag") {
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.setLineDash([]);
      ctx.lineWidth = 1.5;
    }
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Nodes
  nodes.forEach(n => {
    // Glow ring for tags (they are hubs)
    if (n.type === "tag") {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = n.color + "33";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    // Outer ring for tasks
    if (n.type === "task") {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = n.color + "44";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Fill
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    ctx.fill();

    // Label — guard against undefined
    const rawLabel = n.label ?? "";
    const maxCh = n.type === "project" ? 18 : n.type === "tag" ? 12 : 13;
    const lbl   = rawLabel.length > maxCh ? rawLabel.slice(0, maxCh - 1) + "…" : rawLabel;
    ctx.textAlign = "center";
    if (n.type === "project") {
      ctx.font = "500 11px 'DM Sans',system-ui,sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(lbl, n.x, n.y + 4);
    } else if (n.type === "tag") {
      ctx.font = "500 10px 'DM Sans',system-ui,sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(lbl, n.x, n.y + 4);
    } else {
      ctx.font = "400 10px 'DM Sans',system-ui,sans-serif";
      ctx.fillStyle = "#1a1a18";
      ctx.fillText(lbl, n.x, n.y + n.r + 13);
    }
  });

  ctx.restore();
}

// ── Hit test ──────────────────────────────────────────────────────────────────
export function hitTest(
  nodes: GraphNode[],
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  cam: Camera,
): GraphNode | undefined {
  const rect = canvas.getBoundingClientRect();
  const mx   = (e.clientX - rect.left - cam.ox) / cam.scale;
  const my   = (e.clientY - rect.top  - cam.oy) / cam.scale;
  return nodes.find(n => Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) < n.r + 5);
}