import { useRef, useEffect, useCallback, useState } from "react";
import type {
  Task, Tag, GraphData, Camera, TooltipData, GraphNode,
} from "../../types/projectTypes";
import { GRAPH_LEGEND, GRAPH_NODE_TYPE_LABEL } from "../../constants/projectConstants";
import { buildGraph, renderGraph, hitTest } from "../../util/graphUtils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GraphViewProps {
  tasks: Task[];
  tags: Tag[];
  projectName: string;
  onTaskClick: (id: string) => void;
}

// ── Legend ────────────────────────────────────────────────────────────────────
function GraphLegend() {
  return (
    <div style={{
      position: "absolute", top: 14, left: 14,
      background: "#fff", border: "0.5px solid #e2e0d8",
      borderRadius: 8, padding: "9px 13px",
    }}>
      {GRAPH_LEGEND.map(({ color, label }, i) => (
        <div
          key={label}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            marginBottom: i < GRAPH_LEGEND.length - 1 ? 5 : 0,
          }}
        >
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 11, color: "#6b6960" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface TooltipProps { data: TooltipData; }

function NodeTooltip({ data }: TooltipProps) {
  return (
    <div style={{
      position: "absolute", left: data.x, top: data.y,
      background: "#fff", border: "0.5px solid #ccc9bf",
      borderRadius: 8, padding: "9px 13px",
      pointerEvents: "none", zIndex: 50,
      boxShadow: "0 4px 16px rgba(0,0,0,.07)", minWidth: 140,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        fontSize: 10, color: "#9c9a8e", textTransform: "uppercase",
        letterSpacing: "0.06em", marginBottom: 3, fontFamily: "monospace",
      }}>
        {GRAPH_NODE_TYPE_LABEL[data.node.type]}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 500, color: "#1a1a18",
        marginBottom: data.extra.length > 0 ? 7 : 0,
      }}>
        {data.node.label}
      </div>
      {data.extra.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {data.extra.map((e, i) => (
            <div key={i} style={{
              fontSize: 11, color: "#6b6960",
              background: "#f4f3ef", padding: "2px 7px",
              borderRadius: 4,
            }}>
              {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function GraphView({ tasks, tags, projectName, onTaskClick }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camRef    = useRef<Camera>({ ox: 0, oy: 0, scale: 1, drag: false, lx: 0, ly: 0 });
  const graphRef  = useRef<GraphData>({ nodes: [], edges: [] });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { nodes, edges } = graphRef.current;
    renderGraph(ctx, canvas.width, canvas.height, nodes, edges, camRef.current);
  }, []);

  const rebuild = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    graphRef.current = buildGraph(tasks, tags, projectName, W, H);
    redraw();
  }, [tasks, tags, projectName, redraw]);

  useEffect(() => { rebuild(); }, [rebuild]);

  useEffect(() => {
    const ro     = new ResizeObserver(rebuild);
    const parent = canvasRef.current?.parentElement;
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, [rebuild]);

  // Wheel must be passive:false — cannot be set as React prop
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const cam = camRef.current;
    cam.scale = Math.max(0.2, Math.min(4, cam.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
    redraw();
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const buildTooltip = useCallback((
    hit: GraphNode,
    canvasEl: HTMLCanvasElement,
    e: React.MouseEvent<HTMLCanvasElement>,
  ): TooltipData => {
    const rect = canvasEl.getBoundingClientRect();
    let extra: string[] = [];

    if (hit.type === "task" && hit.taskId) {
      // Show which tags group this task
      const task = tasks.find(t => t.id === hit.taskId);
      if (task) {
        extra = task.tags
          .map(tid => tags.find(tg => tg.id === tid)?.name)
          .filter((n): n is string => Boolean(n));
      }
    } else if (hit.type === "tag" && hit.tagId) {
      // Show tasks grouped under this tag
      extra = tasks
        .filter(t => t.tags.includes(hit.tagId!))
        .map(t => t.title)
        .slice(0, 5);
    }

    return {
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top  - 14,
      node: hit,
      extra,
    };
  }, [tasks, tags]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cam    = camRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (cam.drag) {
      cam.ox += e.clientX - cam.lx;
      cam.oy += e.clientY - cam.ly;
      cam.lx  = e.clientX;
      cam.ly  = e.clientY;
      redraw();
      return;
    }

    const hit = hitTest(graphRef.current.nodes, e, canvas, cam);
    if (hit) setTooltip(buildTooltip(hit, canvas, e));
    else setTooltip(null);
  }, [redraw, buildTooltip]);

  const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(graphRef.current.nodes, e, canvas, camRef.current);
    if (hit?.type === "task" && hit.taskId) onTaskClick(hit.taskId);
  }, [onTaskClick]);

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f4f3ef" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }}
        onMouseDown={e => {
          camRef.current.drag = true;
          camRef.current.lx   = e.clientX;
          camRef.current.ly   = e.clientY;
        }}
        onMouseUp={()    => { camRef.current.drag = false; }}
        onMouseLeave={()  => { camRef.current.drag = false; setTooltip(null); }}
        onMouseMove={onMouseMove}
        onClick={onClick}
      />

      <GraphLegend />

      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        fontSize: 11, color: "#9c9a8e", fontFamily: "monospace",
        background: "#fff", padding: "5px 13px", borderRadius: 20,
        border: "0.5px solid #e2e0d8", pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        arraste · scroll p/ zoom · clique na tarefa
      </div>

      {tooltip && <NodeTooltip data={tooltip} />}
    </div>
  );
}